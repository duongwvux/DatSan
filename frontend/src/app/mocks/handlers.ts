import { delay, http, HttpResponse } from 'msw'
import type { ApiErrorResponse, PageResponse } from '@/shared/api'
import type { VenueSummary } from '@/entities/venue'
import { demoUser, venues } from './fixtures'

/**
 * Mock API theo hợp đồng docs/use-case-api.md. Mỗi thành viên thêm handler cho module của mình
 * vào file riêng (ví dụ `handlers/booking.ts`) rồi gộp tại đây.
 * Đăng nhập demo: demo@datsan.vn / password
 */
const api = (path: string) => `*/api/v1${path}`

// Giả lập cookie refresh: lưu trạng thái đăng nhập qua các lần tải lại trang.
const SESSION_KEY = 'datsan.mock.loggedIn'
const mockSession = {
  get: () => sessionStorage.getItem(SESSION_KEY) === '1',
  set: (value: boolean) =>
    value ? sessionStorage.setItem(SESSION_KEY, '1') : sessionStorage.removeItem(SESSION_KEY),
}

function error(status: number, code: string, message: string) {
  const body: ApiErrorResponse = {
    code,
    message,
    timestamp: new Date().toISOString(),
    errors: [],
  }
  return HttpResponse.json(body, { status })
}

const tokenResponse = () =>
  HttpResponse.json({ accessToken: 'mock-access-token', tokenType: 'Bearer', expiresIn: 900 })

export const handlers = [
  http.post(api('/auth/login'), async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as { email: string; password: string }
    if (body.email !== demoUser.email || body.password !== 'password') {
      return error(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.')
    }
    mockSession.set(true)
    return tokenResponse()
  }),

  http.post(api('/auth/refresh'), () =>
    mockSession.get() ? tokenResponse() : error(401, 'INVALID_TOKEN', 'Phiên đăng nhập đã hết hạn.'),
  ),

  http.post(api('/auth/logout'), () => {
    mockSession.set(false)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(api('/users/me'), () =>
    mockSession.get()
      ? HttpResponse.json(demoUser)
      : error(401, 'AUTHENTICATION_REQUIRED', 'Vui lòng đăng nhập.'),
  ),

  http.get(api('/venues'), async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const sport = url.searchParams.get('sport')
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)

    const filtered = venues.filter(
      (venue) =>
        (!q || `${venue.name} ${venue.address}`.toLowerCase().includes(q)) &&
        (!sport || venue.sports.includes(sport as VenueSummary['sports'][number])),
    )
    const body: PageResponse<VenueSummary> = {
      items: filtered.slice(page * size, (page + 1) * size),
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    }
    return HttpResponse.json(body)
  }),
]

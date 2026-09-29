import { http, refreshAccessToken, type TokenResponse } from '@/shared/api'
import type { CurrentUser } from '../model/types'

export const sessionApi = {
  login: (body: { email: string; password: string }) =>
    http.post<TokenResponse>('/auth/login', body).then((res) => res.data),

  logout: () => http.post<void>('/auth/logout'),

  getMe: () => http.get<CurrentUser>('/users/me').then((res) => res.data),

  /** Khôi phục phiên khi tải trang: dùng cookie refresh để lấy access token mới. */
  async restore(): Promise<CurrentUser | null> {
    const token = await refreshAccessToken()
    if (!token) return null
    return sessionApi.getMe()
  },
}

import { AxiosError, AxiosHeaders } from 'axios'
import { ApiError, toApiError } from '../api-error'

function axiosErrorWith(status: number, data: unknown) {
  const headers = new AxiosHeaders()
  return new AxiosError('fail', 'ERR', { headers }, null, {
    status,
    statusText: '',
    headers: {},
    config: { headers },
    data,
  })
}

describe('toApiError', () => {
  it('đọc đúng schema lỗi chuẩn của backend', () => {
    const error = toApiError(
      axiosErrorWith(409, {
        code: 'BOOKING_SLOT_TAKEN',
        message: 'Khung giờ vừa có người đặt',
        timestamp: '2026-09-28T16:10:00Z',
        errors: [],
      }),
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.is('BOOKING_SLOT_TAKEN')).toBe(true)
  })

  it('trả NETWORK_ERROR khi không có response', () => {
    expect(toApiError(new AxiosError('Network Error')).code).toBe('NETWORK_ERROR')
  })
})

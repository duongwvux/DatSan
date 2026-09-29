import { isAxiosError } from 'axios'
import type { ApiErrorResponse, FieldErrorResponse } from './types'

/**
 * Lỗi đã chuẩn hóa từ backend. Frontend rẽ nhánh theo `code`, không so sánh `message`.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldErrorResponse[]
  readonly traceId?: string
  readonly retryAfterSeconds?: number

  constructor(params: {
    status: number
    code: string
    message: string
    fieldErrors?: FieldErrorResponse[]
    traceId?: string
    retryAfterSeconds?: number
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.fieldErrors = params.fieldErrors ?? []
    this.traceId = params.traceId
    this.retryAfterSeconds = params.retryAfterSeconds
  }

  is(code: string) {
    return this.code === code
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const body: unknown = error.response?.data
    const retryAfter = Number(error.response?.headers?.['retry-after'])

    if (isApiErrorBody(body)) {
      return new ApiError({
        status,
        code: body.code,
        message: body.message,
        fieldErrors: body.errors ?? [],
        traceId: body.traceId,
        retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
      })
    }

    if (!error.response) {
      return new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.',
      })
    }
  }

  return new ApiError({
    status: 0,
    code: 'UNKNOWN_ERROR',
    message: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  })
}

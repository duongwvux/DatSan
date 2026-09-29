/** Hợp đồng chung — docs/use-case-api.md mục 5 và 8. */

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  page?: number
  size?: number
  /** Ví dụ: `createdAt,desc`. Có thể lặp. */
  sort?: string | string[]
}

export interface FieldErrorResponse {
  field: string
  code: string
  message: string
}

export interface ApiErrorResponse {
  code: string
  message: string
  timestamp: string
  path?: string
  traceId?: string
  errors: FieldErrorResponse[]
}

/** Số nguyên VND. */
export type Money = number

/** Timestamp RFC 3339, response chuẩn UTC `Z`. */
export type IsoDateTime = string

/** Ngày thuần `YYYY-MM-DD`. */
export type IsoDate = string

export type Uuid = string

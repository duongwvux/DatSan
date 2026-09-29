import type { IsoDateTime, Money, Uuid } from '@/shared/api'

/** use-case-api.md mục 3.3. TV2 sở hữu — cập nhật theo OpenAPI khi được duyệt. */
export type BookingStatus = 'HOLD' | 'PAID' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED' | 'NO_SHOW'

export type BookingGroup = 'upcoming' | 'played' | 'cancelled'

export interface Booking {
  id: Uuid
  bookingCode: string
  courtId: Uuid
  status: BookingStatus
  startAt: IsoDateTime
  endAt: IsoDateTime
  totalAmount: Money
  currency: 'VND'
  createdAt: IsoDateTime
  expiresAt: IsoDateTime | null
  refund: unknown | null
}

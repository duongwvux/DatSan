import type { Money, PageParams, Uuid } from '@/shared/api'

/** F71: loại sân con. Chốt tên enum với TV4 khi viết OpenAPI. */
export type SportType = 'BADMINTON' | 'PICKLEBALL' | 'FOOTBALL_5' | 'FOOTBALL_7'

export interface GeoPoint {
  lat: number
  lng: number
}

/**
 * Đề xuất `VenueSummaryResponse` cho GET /venues (TV1 sở hữu).
 * Đây là bản nháp frontend — cập nhật theo docs/openapi.yaml khi được duyệt.
 */
export interface VenueSummary {
  id: Uuid
  name: string
  address: string
  district: string
  sports: SportType[]
  coverImageUrl: string | null
  ratingAverage: number | null
  ratingCount: number
  minPricePerHour: Money
  location: GeoPoint | null
  /** Chỉ có khi request gửi kèm vị trí người dùng. */
  distanceKm: number | null
}

export interface VenueSearchParams extends PageParams {
  q?: string
  sport?: SportType
  district?: string
  minPrice?: number
  maxPrice?: number
  date?: string
  lat?: number
  lng?: number
  featured?: boolean
}

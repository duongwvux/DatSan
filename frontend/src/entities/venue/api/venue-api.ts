import { queryOptions } from '@tanstack/react-query'
import { http, type PageResponse } from '@/shared/api'
import type { VenueSearchParams, VenueSummary } from '../model/types'

export const venueApi = {
  search: (params: VenueSearchParams) =>
    http
      .get<PageResponse<VenueSummary>>('/venues', { params, paramsSerializer: { indexes: null } })
      .then((res) => res.data),
}

/** Query key tập trung — dùng chung để invalidate. */
export const venueQueries = {
  all: () => ['venues'] as const,
  search: (params: VenueSearchParams) =>
    queryOptions({
      queryKey: [...venueQueries.all(), 'search', params] as const,
      queryFn: () => venueApi.search(params),
    }),
}

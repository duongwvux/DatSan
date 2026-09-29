import { useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { VenueCard, VenueCardSkeleton, venueQueries, type SportType } from '@/entities/venue'
import { VenueSearchBar } from '@/features/search-venues'
import { EmptyState, PageHeader } from '@/shared/ui'

/** F11, F12 — TV1. Bộ lọc nâng cao, bản đồ Leaflet và phân trang sẽ bổ sung ở tuần 3. */
export function VenuesPage() {
  const [searchParams] = useSearchParams()
  const params = {
    q: searchParams.get('q') ?? undefined,
    sport: (searchParams.get('sport') as SportType | null) ?? undefined,
    date: searchParams.get('date') ?? undefined,
    page: 0,
    size: 20,
  }
  const { data, isPending, isError } = useQuery(venueQueries.search(params))

  return (
    <div className="container-page space-y-8 py-10">
      <PageHeader
        title="Tìm sân"
        description={data ? `${data.totalElements} sân phù hợp` : 'Đang tìm sân phù hợp…'}
      />
      <VenueSearchBar />
      {isError ? (
        <EmptyState icon={SearchX} title="Không tải được kết quả" description="Vui lòng thử lại sau." />
      ) : !isPending && data.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Không tìm thấy sân"
          description="Thử đổi từ khóa hoặc môn thể thao."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isPending
            ? Array.from({ length: 8 }, (_, index) => <VenueCardSkeleton key={index} />)
            : data.items.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
        </div>
      )}
    </div>
  )
}

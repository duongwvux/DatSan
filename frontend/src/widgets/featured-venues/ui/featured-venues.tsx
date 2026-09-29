import { useQuery } from '@tanstack/react-query'
import { ArrowRight, SearchX } from 'lucide-react'
import { Link } from 'react-router'
import { VenueCard, VenueCardSkeleton, venueQueries } from '@/entities/venue'
import { routes } from '@/shared/config'
import { Button, EmptyState } from '@/shared/ui'

/** F10 — sân nổi bật trên trang chủ. */
export function FeaturedVenues() {
  const { data, isPending, isError, refetch } = useQuery(
    venueQueries.search({ featured: true, size: 4, sort: 'ratingAverage,desc' }),
  )

  return (
    <section className="container-page space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Sân nổi bật</h2>
          <p className="mt-1 text-muted-foreground">Được người chơi đánh giá cao nhất tuần này</p>
        </div>
        <Button variant="ghost" asChild className="hidden sm:inline-flex">
          <Link to={routes.venues}>
            Xem tất cả <ArrowRight />
          </Link>
        </Button>
      </div>

      {isError ? (
        <EmptyState
          icon={SearchX}
          title="Không tải được danh sách sân"
          action={<Button onClick={() => refetch()}>Thử lại</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => <VenueCardSkeleton key={index} />)
            : data.items.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
        </div>
      )}
    </section>
  )
}

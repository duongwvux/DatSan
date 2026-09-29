import { MapPin, Star } from 'lucide-react'
import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { cn, formatVndShort } from '@/shared/lib'
import { Badge, Card, Skeleton } from '@/shared/ui'
import { SPORTS } from '../model/sports'
import type { VenueSummary } from '../model/types'

export function VenueCard({ venue, className }: { venue: VenueSummary; className?: string }) {
  return (
    <Card
      className={cn(
        'group gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      <Link to={routes.venueDetail(venue.id)} className="focus-visible:outline-none">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-brand-accent/25" />
          {venue.coverImageUrl && (
            <img
              src={venue.coverImageUrl}
              alt={venue.name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
              className="relative size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {venue.sports.map((sport) => (
              <Badge key={sport} variant="secondary" className="bg-background/90 backdrop-blur">
                {SPORTS[sport].emoji} {SPORTS[sport].label}
              </Badge>
            ))}
          </div>
          {venue.distanceKm !== null && (
            <span className="absolute right-3 bottom-3 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-medium text-background">
              {venue.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 font-semibold">{venue.name}</h3>
            {venue.ratingAverage !== null && (
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
                <Star className="size-4 fill-brand-accent text-brand-accent" />
                {venue.ratingAverage.toFixed(1)}
                <span className="font-normal text-muted-foreground">({venue.ratingCount})</span>
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </p>
          <p className="text-sm">
            Từ{' '}
            <span className="text-base font-bold text-primary">{formatVndShort(venue.minPricePerHour)}</span>
            <span className="text-muted-foreground">/giờ</span>
          </p>
        </div>
      </Link>
    </Card>
  )
}

export function VenueCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </Card>
  )
}

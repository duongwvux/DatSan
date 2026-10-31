import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Tabs } from 'radix-ui'
import { SPORT_TYPES, SPORTS, venueQueries, type SportType, type VenueSummary } from '@/entities/venue'
import { routes } from '@/shared/config'
import { cn, formatVndShort } from '@/shared/lib'
import { Button, Reveal } from '@/shared/ui'

/** Ảnh mặt sân cho từng môn (ảnh mở, nguồn ghi ở cuối trang chủ). */
const SPORT_PHOTOS: Record<SportType, { src: string; alt: string; position?: string }> = {
  BADMINTON: {
    src: '/images/badminton-hall.jpg',
    alt: 'Sân cầu lông trong nhà, thảm xanh kẻ vạch trắng, cột lưới số 1, một người ngồi nghỉ trên hàng ghế xanh',
  },
  PICKLEBALL: {
    src: '/images/pickleball-courts.jpg',
    alt: 'Dãy sân pickleball ngoài trời, lòng sân xanh dương, viền xanh lá, lưới căng giữa sân',
    position: '50% 70%',
  },
  FOOTBALL_5: {
    src: '/images/hanoi-football-pitch.jpg',
    alt: 'Sân bóng cỏ nhân tạo có lưới bao quanh, nhiều nhóm đang đá, phía sau là nhà cao tầng',
  },
  FOOTBALL_7: {
    src: '/images/hanoi-football-pitch.jpg',
    alt: 'Sân bóng cỏ nhân tạo có lưới bao quanh, nhiều nhóm đang đá, phía sau là nhà cao tầng',
  },
}

/** F10 — sân nổi bật, chia theo môn. Mỗi môn là một tab; danh sách sân là các dải màu kèm ảnh sân. */
export function FeaturedVenues() {
  const [sport, setSport] = useState<SportType>('BADMINTON')
  const { data, isPending, isError, refetch } = useQuery(
    venueQueries.search({ featured: true, size: 20, sort: 'ratingAverage,desc' }),
  )
  const venuesOf = (type: SportType) => data?.items.filter((venue) => venue.sports.includes(type)) ?? []
  const photo = SPORT_PHOTOS[sport]

  return (
    <section aria-labelledby="featured-title" className="bg-court-blue py-24 text-white sm:py-32 lg:py-40">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="featured-title" className="text-[length:var(--step-head)] display-type">
            <span className="mask-line">
              <Reveal as="span" variant="line" className="text-white/70">
                Sân nổi bật
              </Reveal>
            </span>
            <span className="mask-line">
              <Reveal as="span" variant="line" delay={90}>
                theo từng môn
              </Reveal>
            </span>
          </h2>
          <Button
            asChild
            size="lg"
            className="press h-12 bg-chalk px-6 text-base text-ink-field hover:bg-ball sm:shrink-0"
          >
            <Link to={routes.venues}>Xem tất cả sân</Link>
          </Button>
        </div>

        <Tabs.Root
          value={sport}
          onValueChange={(value) => setSport(value as SportType)}
          className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-x-6"
        >
          <div className="lg:col-span-4">
            <Tabs.List
              aria-label="Chọn môn"
              className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1"
            >
              {SPORT_TYPES.map((type, index) => (
                <Reveal key={type} delay={index * 60}>
                  <Tabs.Trigger
                    value={type}
                    className="press flex h-16 w-full flex-col items-start justify-center rounded-md bg-court-blue-tone px-3 text-left hover:bg-court-blue-deep focus-visible:ring-2 focus-visible:ring-ball focus-visible:outline-none data-[state=active]:bg-chalk data-[state=active]:text-ink-field sm:px-4"
                  >
                    <span className="text-base leading-tight font-medium">{SPORTS[type].label}</span>
                    <span className="text-sm opacity-75">
                      {isPending ? '…' : `${venuesOf(type).length} sân`}
                    </span>
                  </Tabs.Trigger>
                </Reveal>
              ))}
            </Tabs.List>

            <Reveal as="figure" variant="picture" delay={120} className="mt-6 hidden sm:block">
              <div className="relative aspect-[16/9] overflow-clip rounded-md bg-court-blue-deep lg:aspect-[4/3]">
                <div data-drift className="absolute inset-x-0 -inset-y-[5%]">
                  <img
                    key={photo.src}
                    src={photo.src}
                    alt={photo.alt}
                    width={1280}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: photo.position }}
                    className="size-full animate-[photo-in_700ms_cubic-bezier(0.22,1,0.36,1)] object-cover motion-reduce:animate-none"
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {SPORT_TYPES.map((type) => (
            <Tabs.Content key={type} value={type} className="focus-visible:outline-none lg:col-span-8">
              {isError ? (
                <div className="rounded-md bg-white/10 p-6">
                  <p className="text-lg font-medium">Chưa tải được danh sách sân.</p>
                  <Button
                    onClick={() => refetch()}
                    className="press mt-4 bg-chalk text-ink-field hover:bg-ball"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : isPending ? (
                <ul aria-busy className="space-y-1">
                  {Array.from({ length: 3 }, (_, index) => (
                    <li key={index} className="h-[7.5rem] animate-pulse rounded-md bg-white/10" />
                  ))}
                </ul>
              ) : venuesOf(type).length === 0 ? (
                <div className="rounded-md bg-white/10 p-6">
                  <p className="text-lg font-medium">
                    Chưa có sân {SPORTS[type].label.toLowerCase()} nổi bật.
                  </p>
                  <Link
                    to={`${routes.venues}?sport=${type}`}
                    className="mt-2 inline-block underline underline-offset-4"
                  >
                    Tìm tất cả sân {SPORTS[type].label.toLowerCase()}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1">
                  {venuesOf(type).map((venue, index) => (
                    <Reveal as="li" key={venue.id} delay={index * 70}>
                      <VenueBand venue={venue} tone={index % 2 === 0 ? 'a' : 'b'} />
                    </Reveal>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  )
}

function VenueBand({ venue, tone }: { venue: VenueSummary; tone: 'a' | 'b' }) {
  return (
    <Link
      to={routes.venueDetail(venue.id)}
      className={cn(
        'group grid grid-cols-[6rem_1fr] items-center gap-x-4 overflow-clip rounded-md pr-4 transition-colors duration-200 hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-ball focus-visible:outline-none sm:grid-cols-[10rem_6.5rem_1fr_auto] sm:gap-x-5 sm:pr-5',
        tone === 'a' ? 'bg-white/[0.08]' : 'bg-white/[0.14]',
      )}
    >
      <span className="row-span-2 block h-full min-h-[4.5rem] self-stretch overflow-clip bg-court-blue-deep sm:row-span-1 sm:aspect-[4/3] sm:h-auto">
        {venue.coverImageUrl ? (
          <img
            src={venue.coverImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center text-sm text-white/75">Chưa có ảnh</span>
        )}
      </span>
      <p className="self-end pt-3 text-[length:var(--step-body)] font-semibold tabular sm:self-center sm:pt-0">
        {formatVndShort(venue.minPricePerHour)}
        <span className="text-sm font-normal text-white/75">/giờ</span>
      </p>
      <div className="min-w-0 self-start pb-3 sm:self-center sm:pb-0">
        <p className="truncate text-[length:var(--step-body)] font-medium">{venue.name}</p>
        <p className="truncate text-sm text-white/75">{venue.address}</p>
      </div>
      {venue.ratingAverage !== null && (
        <span className="hidden items-center gap-1 text-sm tabular sm:flex">
          <Star aria-hidden className="size-3.5 fill-current" />
          {venue.ratingAverage.toFixed(1).replace('.', ',')}
          <span className="text-white/75">({venue.ratingCount})</span>
        </span>
      )}
    </Link>
  )
}

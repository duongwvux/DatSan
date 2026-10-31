import { CalendarDays, MapPin } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { createSearchParams, useNavigate } from 'react-router'
import { SPORT_TYPES, SPORTS, type SportType } from '@/entities/venue'
import { routes } from '@/shared/config'
import { cn, dayjs } from '@/shared/lib'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

const ALL = 'ALL'

type VenueSearchBarProps = {
  className?: string
  /** `row`: một hàng ngang (trang tìm sân). `stack`: xếp dọc trong cột hẹp (hero trang chủ). */
  layout?: 'row' | 'stack'
}

/** F11 — thanh tìm kiếm nhanh; điều hướng sang trang kết quả với query string. */
export function VenueSearchBar({ className, layout = 'row' }: VenueSearchBarProps) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sport, setSport] = useState<SportType | typeof ALL>(ALL)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const params: Record<string, string> = { date }
    if (q.trim()) params.q = q.trim()
    if (sport !== ALL) params.sport = sport
    navigate({ pathname: routes.venues, search: createSearchParams(params).toString() })
  }

  const stacked = layout === 'stack'
  const field = 'h-12 rounded-md border-0 bg-card shadow-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('grid gap-2', stacked ? 'grid-cols-2' : 'md:grid-cols-[1.6fr_1fr_1fr_auto]', className)}
    >
      <label className={cn('relative', stacked && 'col-span-2')}>
        <span className="sr-only">Tên sân hoặc khu vực</span>
        <MapPin className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Tên sân, quận, đường…"
          className={cn(field, 'pl-10 text-base')}
        />
      </label>
      <Select value={sport} onValueChange={(value) => setSport(value as SportType | typeof ALL)}>
        <SelectTrigger className={cn(field, 'h-12! w-full text-base')} aria-label="Môn thể thao">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả môn</SelectItem>
          {SPORT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {SPORTS[type].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="relative">
        <span className="sr-only">Ngày chơi</span>
        <CalendarDays className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="date"
          value={date}
          min={dayjs().format('YYYY-MM-DD')}
          max={dayjs().add(14, 'day').format('YYYY-MM-DD')}
          onChange={(event) => setDate(event.target.value)}
          className={cn(field, 'pl-10 text-base')}
        />
      </label>
      <Button type="submit" size="lg" className={cn('press h-12 px-7 text-base', stacked && 'col-span-2')}>
        Tìm sân
      </Button>
    </form>
  )
}

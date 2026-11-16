import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { routes } from '@/shared/config'
import { cn, dayjs, formatVnd } from '@/shared/lib'

/*
 * Mảnh giao diện lưới giờ cho hero trang chủ. Dữ liệu là mẫu, sinh cố định theo ngày để trang luôn có
 * ô trống / đã đặt / đang giữ hợp lý. Lịch thật (F20, F21) do TV2 làm ở features/select-time-slots.
 */

const VENUE = {
  id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000001',
  name: 'Sân cầu lông Thành Công',
  place: 'Đống Đa',
}
const COURTS = ['Sân 1', 'Sân 2', 'Sân 3', 'Sân 4']
const FIRST_HOUR = 17
const CELLS = 10 // 17:00 → 22:00, mỗi ô 30 phút
const PEAK_FROM = 18
const PRICE_PER_CELL = { normal: 40_000, peak: 55_000 } // 80k và 110k một giờ
const MIN_CELLS = 2
const MAX_CELLS = 8

type CellState = 'free' | 'booked' | 'held' | 'past'
type Selection = { court: number; start: number; end: number }

const cellStart = (cell: number) => FIRST_HOUR * 60 + cell * 30
const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const cellPrice = (cell: number) =>
  cellStart(cell) >= PEAK_FROM * 60 ? PRICE_PER_CELL.peak : PRICE_PER_CELL.normal

function hash(text: string) {
  let value = 2166136261
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619)
  return (value >>> 0) / 4294967295
}

function buildDay(date: dayjs.Dayjs, now: dayjs.Dayjs): CellState[][] {
  const key = date.format('YYYY-MM-DD')
  return COURTS.map((_, court) =>
    Array.from({ length: CELLS }, (_, cell) => {
      if (date.isSame(now, 'day') && cellStart(cell) < now.hour() * 60 + now.minute()) return 'past'
      const roll = hash(`${key}:${court}:${Math.floor(cell / 2)}`)
      const busy = cellStart(cell) >= 18 * 60 && cellStart(cell) < 21 * 60 ? 0.55 : 0.3
      if (roll < busy) return 'booked'
      if (roll < busy + 0.07) return 'held'
      return 'free'
    }),
  )
}

function firstFreeRun(day: CellState[][], length: number): Selection | null {
  for (let cell = CELLS - length; cell >= 0; cell -= 1) {
    for (let court = 0; court < COURTS.length; court += 1) {
      const row = day[court]!
      if (row.slice(cell, cell + length).every((state) => state === 'free'))
        return { court, start: cell, end: cell + length - 1 }
    }
  }
  return null
}

export function SlotPreview() {
  const navigate = useNavigate()
  const now = useMemo(() => dayjs(), [])
  const days = useMemo(() => [0, 1, 2].map((offset) => now.startOf('day').add(offset, 'day')), [now])
  const [dayIndex, setDayIndex] = useState(() => (now.hour() >= 20 ? 1 : 0))
  const grid = useMemo(() => buildDay(days[dayIndex]!, now), [days, dayIndex, now])
  const [selection, setSelection] = useState<Selection | null>(() => firstFreeRun(grid, 3))

  const changeDay = (index: number) => {
    setDayIndex(index)
    setSelection(firstFreeRun(buildDay(days[index]!, now), 3))
  }

  const isFree = (court: number, from: number, to: number) =>
    grid[court]!.slice(from, to + 1).every((state) => state === 'free')

  const pick = (court: number, cell: number) => {
    if (selection && selection.court === court) {
      if (
        cell > selection.end &&
        cell - selection.start < MAX_CELLS &&
        isFree(court, selection.end + 1, cell)
      ) {
        return setSelection({ ...selection, end: cell })
      }
      if (
        cell < selection.start &&
        selection.end - cell < MAX_CELLS &&
        isFree(court, cell, selection.start - 1)
      ) {
        return setSelection({ ...selection, start: cell })
      }
    }
    const end = cell + 1 < CELLS && isFree(court, cell + 1, cell + 1) ? cell + 1 : cell
    setSelection({ court, start: cell, end })
  }

  const cells = selection ? selection.end - selection.start + 1 : 0
  const total = selection
    ? Array.from({ length: cells }, (_, i) => cellPrice(selection.start + i)).reduce((a, b) => a + b, 0)
    : 0
  const valid = cells >= MIN_CELLS
  const minutes = cells * 30
  const duration =
    `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} giờ` : ''}${minutes % 60 ? ` ${minutes % 60} phút` : ''}`.trim()

  const dayLabel = (day: dayjs.Dayjs, index: number) =>
    index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : day.format('dd D/M')

  return (
    <div data-ui className="w-[min(40rem,calc(100vw-2rem))] rounded-md bg-card text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div>
          <p className="text-[0.9375rem] font-semibold">{VENUE.name}</p>
          <p className="text-[0.8125rem] text-muted-foreground">{VENUE.place} · 80k/giờ, sau 18:00 là 110k</p>
        </div>
        <div
          role="tablist"
          aria-label="Ngày chơi"
          className="flex rounded-md bg-muted p-0.5 text-[0.8125rem]"
        >
          {days.map((day, index) => (
            <button
              key={day.valueOf()}
              type="button"
              role="tab"
              aria-selected={dayIndex === index}
              onClick={() => changeDay(index)}
              className={cn(
                'rounded-[4px] px-2.5 py-1 font-medium transition-colors',
                dayIndex === index ? 'bg-card' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {dayLabel(day, index)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto px-5">
        <div
          role="group"
          aria-label={`Giờ trống ${dayLabel(days[dayIndex]!, dayIndex).toLowerCase()}`}
          className="grid min-w-[30rem] grid-cols-[3.5rem_repeat(10,minmax(0,1fr))] gap-1 text-[0.8125rem]"
        >
          <span />
          {Array.from({ length: CELLS / 2 }, (_, hour) => (
            <span key={hour} className="col-span-2 text-muted-foreground tabular">
              {clock((FIRST_HOUR + hour) * 60)}
            </span>
          ))}
          {COURTS.map((court, courtIndex) => (
            <div key={court} className="contents">
              <span className="self-center font-medium">{court}</span>
              {grid[courtIndex]!.map((state, cell) => {
                const selected =
                  selection?.court === courtIndex && cell >= selection.start && cell <= selection.end
                const label = `${court}, ${clock(cellStart(cell))}–${clock(cellStart(cell) + 30)}`
                return (
                  <button
                    key={cell}
                    type="button"
                    disabled={state !== 'free'}
                    aria-pressed={selected}
                    aria-label={`${label}, ${selected ? 'đang chọn' : STATE_LABEL[state]}`}
                    onClick={() => pick(courtIndex, cell)}
                    className={cn(
                      'h-10 rounded-[3px] transition-colors duration-150',
                      selected && 'bg-slot-selected ring-1 ring-foreground ring-inset',
                      !selected &&
                        state === 'free' &&
                        'border border-input bg-slot-available hover:bg-ball/35',
                      state === 'booked' && 'bg-slot-booked',
                      state === 'held' && 'bg-slot-held',
                      state === 'past' && 'bg-slot-past',
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-5 text-[0.8125rem] text-muted-foreground">
        <Legend className="border border-input bg-slot-available">Trống</Legend>
        <Legend className="bg-slot-booked">Đã đặt</Legend>
        <Legend className="bg-slot-held">Đang được giữ</Legend>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-b-md bg-muted/60 px-5 py-4">
        {selection ? (
          <div className="min-w-0">
            <p className="text-[0.9375rem] font-medium">
              {COURTS[selection.court]} · {clock(cellStart(selection.start))}–
              {clock(cellStart(selection.end) + 30)}
            </p>
            <p className="text-[0.8125rem] text-muted-foreground" aria-live="polite">
              {valid ? `${duration} · ${formatVnd(total)}` : 'Đặt ít nhất 1 tiếng'}
            </p>
          </div>
        ) : (
          <p className="text-[0.9375rem] text-muted-foreground">Chọn giờ bạn muốn chơi</p>
        )}
        <button
          type="button"
          disabled={!valid}
          onClick={() => navigate(routes.venueDetail(VENUE.id))}
          className="press rounded-md bg-primary px-5 py-2.5 text-[0.9375rem] font-medium text-primary-foreground hover:bg-court-green hover:text-white disabled:opacity-40"
        >
          Đặt sân
        </button>
      </div>
    </div>
  )
}

const STATE_LABEL: Record<CellState, string> = {
  free: 'còn trống',
  booked: 'đã đặt',
  held: 'đang được giữ',
  past: 'đã qua giờ',
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={cn('size-3 rounded-[2px]', className)} />
      {children}
    </span>
  )
}

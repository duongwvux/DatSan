import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn, formatVnd } from '@/shared/lib'
import { Reveal } from '@/shared/ui'

/*
 * "Đặt là có sân": bốn bước của một lượt đặt, xếp thành dải bảng màu từ đậm (cỏ đêm) đến nhạt.
 * Mỗi bước có một mảnh giao diện mẫu; mã đơn, số tiền và mã check-in là dữ liệu mẫu.
 */

const SAMPLE = { court: 'Sân 3', time: '20:00–21:30', total: 165_000, code: 'DS7K9M2Q', checkIn: '482 913' }

type Step = { name: string; text: string; fill: string; ui: ReactNode }

const STEPS: Step[] = [
  {
    name: 'Chọn giờ',
    text: 'Xem sân nào còn trống vào giờ bạn rảnh, chọn chơi từ 1 đến 4 tiếng.',
    fill: 'bg-turf text-white',
    ui: <PickUi />,
  },
  {
    name: 'Giữ chỗ',
    text: 'Giờ bạn chọn được giữ riêng trong 5 phút, đủ để chuyển khoản. Không lo bị người khác đặt mất.',
    fill: 'bg-court-green-deep text-white',
    ui: <HoldUi />,
  },
  {
    name: 'Chuyển khoản',
    text: 'Quét mã QR bằng app ngân hàng, số tiền và nội dung có sẵn. Tiền vào là bạn nhận xác nhận ngay.',
    fill: 'bg-court-green text-white',
    ui: <PayUi />,
  },
  {
    name: 'Ra sân',
    text: 'Tới nơi, đọc mã check-in cho chủ sân là vào chơi. Bận đột xuất thì hủy trước 24 tiếng để được hoàn tiền.',
    fill: 'bg-court-mint text-ink-field',
    ui: <CheckInUi />,
  },
]

export function BookingSteps() {
  const [open, setOpen] = useState(0)
  const id = useId()

  return (
    <section aria-labelledby="steps-title" className="bg-chalk py-24 text-ink-field sm:py-32 lg:py-40">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-6">
          <h2 id="steps-title" className="text-[length:var(--step-head)] display-type lg:col-span-5">
            <span className="mask-line">
              <Reveal as="span" variant="line">
                Đặt là
              </Reveal>
            </span>
            <span className="mask-line">
              <Reveal as="span" variant="line" delay={90}>
                có sân
              </Reveal>
            </span>
          </h2>
          <Reveal
            as="p"
            delay={160}
            className="max-w-[46ch] self-end text-[length:var(--step-body)] leading-normal lg:col-span-5 lg:col-start-7"
          >
            Không phải nhắn tin chờ chủ sân trả lời. Chuyển khoản xong là sân đã là của bạn.
          </Reveal>
        </div>

        {/* Màn hình rộng: dải ngang, bước đang mở chiếm 58% bề ngang */}
        <Reveal delay={200} className="mt-16 hidden h-[32.5rem] overflow-clip rounded-md lg:flex">
          {STEPS.map((step, index) => {
            const isOpen = open === index
            return (
              <div
                key={step.name}
                className={cn(
                  'relative min-w-0 transition-[flex-basis,flex-grow] duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
                  step.fill,
                  isOpen ? 'shrink-0 grow-0 basis-[58%]' : 'grow basis-0',
                )}
              >
                <h3 className="absolute inset-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel-${index}`}
                    onClick={() => setOpen(index)}
                    className={cn(
                      'absolute inset-0 flex p-6 text-left focus-visible:ring-2 focus-visible:ring-ball focus-visible:outline-none focus-visible:ring-inset',
                      isOpen ? 'cursor-default items-start p-10' : 'items-end hover:bg-white/10',
                    )}
                  >
                    <span
                      className={cn(
                        'font-semibold whitespace-nowrap',
                        isOpen
                          ? 'text-[2.5rem] leading-none tracking-[-0.03em]'
                          : 'rotate-180 text-[length:var(--step-body)] [writing-mode:vertical-rl]',
                      )}
                    >
                      {step.name}
                    </span>
                  </button>
                </h3>
                <div
                  id={`${id}-panel-${index}`}
                  hidden={!isOpen}
                  className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-8 p-10"
                >
                  <p className="max-w-[36ch] self-end text-[length:var(--step-body)] leading-normal">
                    {step.text}
                  </p>
                  <div className="pointer-events-auto flex items-center justify-center">{step.ui}</div>
                </div>
              </div>
            )
          })}
        </Reveal>

        {/* Điện thoại và máy tính bảng: các bước xếp dọc, bước đầu mở sẵn */}
        <div className="mt-12 overflow-clip rounded-md lg:hidden">
          {STEPS.map((step, index) => {
            const isOpen = open === index
            return (
              <div key={step.name} className={step.fill}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-stack-${index}`}
                    onClick={() => setOpen(index)}
                    className="flex h-16 w-full items-center px-5 text-left text-[length:var(--step-body)] font-semibold focus-visible:ring-2 focus-visible:ring-ball focus-visible:outline-none focus-visible:ring-inset"
                  >
                    {step.name}
                  </button>
                </h3>
                <div id={`${id}-stack-${index}`} hidden={!isOpen} className="space-y-6 px-5 pb-8">
                  <p className="text-[1.0625rem] leading-normal">{step.text}</p>
                  {step.ui}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function UiCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-ui
      className={cn('w-full max-w-[21rem] rounded-md bg-card p-5 text-card-foreground', className)}
    >
      {children}
    </div>
  )
}

function PickUi() {
  const cells = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
  const booked = new Set(['19:00', '19:30'])
  const selected = new Set(['20:00', '20:30', '21:00'])
  return (
    <UiCard>
      <p className="text-[0.8125rem] text-muted-foreground">{SAMPLE.court} · tối thứ Bảy</p>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {cells.map((time) => (
          <span
            key={time}
            className={cn(
              'h-9 rounded-[3px]',
              selected.has(time) && 'bg-slot-selected ring-1 ring-foreground ring-inset',
              booked.has(time) && 'bg-slot-booked',
              !selected.has(time) && !booked.has(time) && 'border border-input bg-slot-available',
            )}
          />
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-[0.6875rem] text-muted-foreground tabular">
        <span>18:30</span>
        <span className="col-start-4">20:00</span>
        <span className="col-start-7">21:30</span>
      </div>
      <p className="mt-4 font-medium">
        {SAMPLE.time} · {formatVnd(SAMPLE.total)}
      </p>
    </UiCard>
  )
}

function HoldUi() {
  const [left, setLeft] = useState(277)
  useEffect(() => {
    const timer = window.setInterval(() => setLeft((value) => (value <= 1 ? 300 : value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const clock = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
  return (
    <UiCard>
      <p className="text-[0.8125rem] text-muted-foreground">Đang giữ chỗ cho bạn</p>
      <p className="mt-1 text-5xl font-semibold tracking-[-0.03em] tabular" aria-label={`Còn ${clock}`}>
        {clock}
      </p>
      <div className="mt-4 h-1.5 overflow-clip rounded-full bg-muted">
        <div className="h-full bg-court-green" style={{ width: `${(left / 300) * 100}%` }} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Mã đơn</dt>
        <dd className="text-right font-medium tabular">{SAMPLE.code}</dd>
        <dt className="text-muted-foreground">Khung giờ</dt>
        <dd className="text-right font-medium">
          {SAMPLE.court}, {SAMPLE.time}
        </dd>
      </dl>
    </UiCard>
  )
}

/** Hình mã QR vẽ minh họa (không quét được): ba ô định vị ở góc, phần còn lại sinh cố định. */
function QrDrawing() {
  const size = 25
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ].some(([fx, fy]) => x >= fx! && x < fx! + 7 && y >= fy! && y < fy! + 7)
  const finderOn = (x: number, y: number) => {
    const fx = x >= size - 7 ? x - (size - 7) : x
    const fy = y >= size - 7 ? y - (size - 7) : y
    const edge = fx === 0 || fx === 6 || fy === 0 || fy === 6
    const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
    return edge || core
  }
  const modules: Array<[number, number]> = []
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const on = finder(x, y) ? finderOn(x, y) : ((x * 7 + y * 13 + x * y * 3) % 11) % 3 === 0
      if (on) modules.push([x, y])
    }
  }
  return (
    <svg
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      role="img"
      aria-label="Mã VietQR minh họa"
      className="size-32"
    >
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
      {modules.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#101411" />
      ))}
    </svg>
  )
}

function PayUi() {
  return (
    <UiCard className="flex gap-4">
      <QrDrawing />
      <dl className="min-w-0 text-sm">
        <dt className="text-muted-foreground">Số tiền</dt>
        <dd className="font-semibold tabular">{formatVnd(SAMPLE.total)}</dd>
        <dt className="mt-2 text-muted-foreground">Nội dung</dt>
        <dd className="font-semibold tabular">{SAMPLE.code}</dd>
        <dt className="mt-2 text-muted-foreground">Trạng thái</dt>
        <dd className="font-medium">Chờ thanh toán</dd>
      </dl>
    </UiCard>
  )
}

function CheckInUi() {
  return (
    <UiCard>
      <p className="text-[0.8125rem] text-muted-foreground">Mã check-in</p>
      <p className="mt-1 text-4xl font-semibold tracking-[-0.02em] tabular">{SAMPLE.checkIn}</p>
      <p className="mt-4 font-medium">Sân cầu lông Thành Công</p>
      <p className="text-sm text-muted-foreground">
        {SAMPLE.court} · {SAMPLE.time} · đã thanh toán
      </p>
    </UiCard>
  )
}

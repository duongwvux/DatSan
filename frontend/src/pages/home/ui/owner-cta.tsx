import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { routes } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Reveal } from '@/shared/ui'

const KINDS = ['Cầu lông, pickleball', 'Bóng đá'] as const

/** Lời mời chủ sân: bước đầu của hồ sơ đăng ký cơ sở mở sẵn, gõ thử được. */
export function OwnerCta({ footnote }: { footnote?: ReactNode }) {
  const navigate = useNavigate()
  const [name, setName] = useState('Sân cầu lông Thành Công')
  const [kind, setKind] = useState<(typeof KINDS)[number]>(KINDS[0])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    navigate(routes.owner.root)
  }

  return (
    <section aria-labelledby="owner-title" className="bg-court-green py-24 text-white sm:py-32 lg:py-40">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-x-6">
        <div className="self-end lg:col-span-5">
          <h2
            id="owner-title"
            className="text-[clamp(2.5rem,10vw,3.5rem)] display-type lg:text-[clamp(3.25rem,5.2vw,5rem)]"
          >
            <span className="mask-line">
              <Reveal as="span" variant="line">
                Cho thuê sân
              </Reveal>
            </span>
            <span className="mask-line">
              <Reveal as="span" variant="line" delay={90}>
                trên DatSan
              </Reveal>
            </span>
          </h2>
          <Reveal
            as="p"
            delay={180}
            className="mt-8 max-w-[40ch] text-[length:var(--step-body)] leading-normal"
          >
            Khách đặt online và khách gọi điện tới quầy dùng chung một lịch, nên một ô giờ không bao giờ bị
            bán hai lần. Bảng giá giờ vàng, lịch tuần và doanh thu nằm trên cùng một màn hình.
          </Reveal>
        </div>

        <Reveal delay={240} className="lg:col-span-5 lg:col-start-7">
          <form
            data-ui
            onSubmit={handleSubmit}
            aria-labelledby="owner-form-title"
            className="w-full max-w-[27.5rem] rounded-md bg-card p-6 text-card-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.35)]"
          >
            <p id="owner-form-title" className="text-lg font-semibold">
              Đăng ký cơ sở
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hồ sơ được quản trị viên duyệt trước khi lên trang.
            </p>

            <label htmlFor="owner-venue-name" className="mt-6 block text-sm font-medium">
              Tên cơ sở
            </label>
            <input
              id="owner-venue-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />

            <p id="owner-kind-label" className="mt-5 text-sm font-medium">
              Loại sân
            </p>
            <div
              role="radiogroup"
              aria-labelledby="owner-kind-label"
              className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-muted p-1"
            >
              {KINDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={kind === option}
                  onClick={() => setKind(option)}
                  className={cn(
                    'h-9 rounded-[4px] text-sm font-medium transition-colors',
                    kind === option ? 'bg-card' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="press mt-6 h-12 w-full rounded-md bg-primary text-base font-medium text-primary-foreground hover:bg-court-green hover:text-white disabled:opacity-40"
            >
              Tiếp tục
            </button>
          </form>
        </Reveal>
      </div>
      {footnote && <div className="container-page mt-24 text-sm text-white/85">{footnote}</div>}
    </section>
  )
}

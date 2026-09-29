import { ArrowRight, BellRing, CalendarClock, QrCode, ShieldCheck, Star, Zap } from 'lucide-react'
import { Link } from 'react-router'
import { SPORT_TYPES, SPORTS } from '@/entities/venue'
import { VenueSearchBar } from '@/features/search-venues'
import { FeaturedVenues } from '@/widgets/featured-venues'
import { routes } from '@/shared/config'
import { Button } from '@/shared/ui'

const STEPS = [
  {
    icon: CalendarClock,
    title: 'Chọn sân & khung giờ',
    text: 'Lịch trống cập nhật theo thời gian thực, không lo trùng lịch.',
  },
  {
    icon: QrCode,
    title: 'Quét QR thanh toán',
    text: 'Giữ chỗ 5 phút, chuyển khoản VietQR có sẵn số tiền và nội dung.',
  },
  {
    icon: BellRing,
    title: 'Nhận xác nhận ngay',
    text: 'Đơn tự chuyển "đã thanh toán", email nhắc lịch trước 2 giờ.',
  },
]

const STATS = [
  { value: '30s', label: 'để đặt xong một sân' },
  { value: '24/7', label: 'xác nhận tự động' },
  { value: '0đ', label: 'phí đặt sân' },
]

export function HomePage() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-40 -right-20 size-80 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[size:48px_48px] opacity-60" />
        </div>

        <div className="container-page pt-16 pb-8 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
            <Zap className="size-4 text-brand-accent" /> Xác nhận tức thì qua VietQR
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold sm:text-6xl">
            Đặt sân thể thao <span className="text-primary">nhanh như gọi món</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Tìm sân cầu lông, pickleball, bóng đá gần bạn, xem giờ trống theo thời gian thực và thanh toán chỉ
            với một lần quét mã.
          </p>

          <VenueSearchBar className="mx-auto mt-10 max-w-4xl text-left" />

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SPORT_TYPES.map((type) => (
              <Link
                key={type}
                to={`${routes.venues}?sport=${type}`}
                className="rounded-full border bg-background/70 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:border-primary hover:text-primary"
              >
                {SPORTS[type].emoji} {SPORTS[type].label}
              </Link>
            ))}
          </div>

          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-extrabold sm:text-3xl">{stat.value}</dd>
                <dd className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FeaturedVenues />

      {/* Cách hoạt động */}
      <section className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ba bước là có sân</h2>
          <p className="mt-2 text-muted-foreground">Không gọi điện, không chờ xác nhận thủ công.</p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative rounded-2xl border bg-card p-6">
              <span className="absolute top-4 right-5 text-5xl font-extrabold text-muted-foreground/30">
                {index + 1}
              </span>
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA chủ sân */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand-panel px-6 py-12 text-brand-panel-foreground sm:px-12">
          <div
            aria-hidden
            className="absolute -right-16 -bottom-24 size-72 rounded-full bg-brand-accent/30 blur-3xl"
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Bạn là chủ sân?</h2>
              <p className="mt-3 max-w-xl text-brand-panel-foreground/80">
                Quản lý lịch đặt, bảng giá giờ cao điểm và doanh thu trên một màn hình. Khách online và khách
                tại quầy dùng chung một lịch, không bao giờ trùng.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-panel-foreground/90">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4" /> Chống trùng lịch
                </li>
                <li className="flex items-center gap-2">
                  <Star className="size-4" /> Đánh giá thật từ khách đã chơi
                </li>
              </ul>
            </div>
            <div className="md:text-right">
              <Button size="lg" variant="secondary" asChild>
                <Link to={routes.owner.root}>
                  Đăng ký làm chủ sân <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

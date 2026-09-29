import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { Logo } from '@/shared/ui'

const YEAR = new Date().getFullYear()

const COLUMNS = [
  {
    title: 'Người chơi',
    links: [
      { to: routes.venues, label: 'Tìm sân' },
      { to: routes.matches, label: 'Ghép kèo' },
      { to: routes.bookings, label: 'Lịch đặt của tôi' },
    ],
  },
  {
    title: 'Chủ sân',
    links: [
      { to: routes.owner.root, label: 'Quản lý sân' },
      { to: routes.register, label: 'Đăng ký làm chủ sân' },
    ],
  },
]

export function AppFooter() {
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Tìm và đặt sân cầu lông, pickleball, bóng đá trong vài giây. Thanh toán QR, xác nhận tức thì.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-3">
            <h4 className="text-sm font-semibold">{column.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page border-t py-6 text-xs text-muted-foreground">
        © {YEAR} DatSan · Đồ án môn Công nghệ Web
      </div>
    </footer>
  )
}

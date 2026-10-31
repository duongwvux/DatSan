import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { Reveal } from '@/shared/ui'

const YEAR = new Date().getFullYear()

/** Mỗi chữ khoét trong một khối màu mặt sân; chiều cao so le, chân thẳng hàng. Hệ toạ độ SVG 1200 × 300. */
const BLOCKS = [
  { letter: 'D', fill: 'fill-court-green', height: 300 },
  { letter: 'a', fill: 'fill-chalk', height: 216 },
  { letter: 't', fill: 'fill-court-blue', height: 258 },
  { letter: 'S', fill: 'fill-ball', height: 300 },
  { letter: 'a', fill: 'fill-court-mint', height: 192 },
  { letter: 'n', fill: 'fill-court-green', height: 240 },
]
const GAP = 4
const BLOCK_WIDTH = (1200 - GAP * (BLOCKS.length - 1)) / BLOCKS.length

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
  {
    title: 'Tài khoản',
    links: [
      { to: routes.login, label: 'Đăng nhập' },
      { to: routes.register, label: 'Tạo tài khoản' },
      { to: routes.profile, label: 'Hồ sơ' },
    ],
  },
]

export function AppFooter() {
  return (
    <footer className="bg-ink-field text-chalk">
      <div className="container-page pt-16 pb-8 sm:pt-24">
        <Reveal variant="stage">
          <svg viewBox="0 0 1200 300" role="img" aria-label="DatSan" className="footer-mark block w-full">
            {BLOCKS.map((block, index) => {
              const x = index * (BLOCK_WIDTH + GAP)
              return (
                <g key={index} style={{ '--i': index } as CSSProperties}>
                  <rect
                    x={x}
                    y={300 - block.height}
                    width={BLOCK_WIDTH}
                    height={block.height}
                    className={block.fill}
                  />
                  <text
                    x={x + 14}
                    y={290}
                    className="fill-ink-field text-[230px] font-semibold tracking-[-0.04em]"
                  >
                    {block.letter}
                  </text>
                </g>
              )
            })}
          </svg>
        </Reveal>

        <div className="mt-14 grid gap-10 text-base md:grid-cols-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="font-semibold">{column.title}</h2>
                <ul className="mt-3 space-y-2 text-chalk/75">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="underline-offset-[0.25em] transition-colors hover:text-chalk hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="space-y-2 text-chalk/75 md:col-span-4">
            <p className="font-semibold text-chalk">Về DatSan</p>
            <p>Đồ án môn Công nghệ Web. Sân, giá và lịch trong bản demo là dữ liệu mẫu.</p>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between gap-4 text-sm text-chalk/75">
          <p>© {YEAR} DatSan</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="press rounded-md bg-chalk px-4 py-2 font-medium text-ink-field hover:bg-ball"
          >
            Lên đầu trang
          </button>
        </div>
      </div>
    </footer>
  )
}

import type { CSSProperties } from 'react'
import { VenueSearchBar } from '@/features/search-venues'
import { SlotPreview } from './slot-preview'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties
const line = (index: number) => ({ '--i': index }) as CSSProperties

/**
 * Hero: tiêu đề ở một phần ba trên bên trái; phần còn lại là "sân khấu" màu thảm cầu lông, cắt góc,
 * tràn mép phải và mép dưới, trên đó là lưới giờ dùng thử được.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-x-clip lg:min-h-[max(40rem,calc(100svh-4rem))]"
    >
      <div className="container-page pt-10 sm:pt-16 lg:pt-[5.5rem]">
        <h1
          id="hero-title"
          className="text-[clamp(2.5rem,10vw,3.5rem)] display-type lg:text-[clamp(3.25rem,5.2vw,5rem)]"
        >
          <span className="mask-line">
            <span data-load-line style={line(0)}>
              Xem giờ trống,
            </span>
          </span>
          <span className="mask-line">
            <span data-load-line style={line(1)}>
              đặt sân luôn
            </span>
          </span>
        </h1>
        <div className="lg:w-[calc((100%+1.5rem)/3-1.5rem)]">
          <p
            data-load
            style={delay(420)}
            className="mt-6 max-w-[40ch] text-[length:var(--step-body)] leading-normal sm:mt-8"
          >
            Sân cầu lông, pickleball và bóng đá mini ở Hà Nội. Chọn ô giờ còn trống, giữ chỗ 5 phút rồi quét
            mã VietQR, khỏi gọi điện hỏi chủ sân.
          </p>
          <div data-load style={delay(520)} className="mt-8 max-w-md">
            <VenueSearchBar layout="stack" />
          </div>
        </div>
      </div>

      <div
        data-shutter
        className="relative mt-12 lg:absolute lg:top-[42%] lg:right-0 lg:bottom-0 lg:left-[calc(var(--page-margin)+(100%-2*var(--page-margin)+1.5rem)/3)] lg:mt-0"
      >
        <div className="h-full bg-court-green px-4 pt-12 pb-10 [clip-path:polygon(3rem_0,100%_0,100%_100%,0_100%,0_3rem)] sm:px-8 lg:px-14 lg:pt-14 lg:pb-0">
          <div data-settle>
            <SlotPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

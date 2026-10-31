import { FeaturedVenues } from '@/widgets/featured-venues'
import { BookingSteps } from './booking-steps'
import { Hero } from './hero'
import { OwnerCta } from './owner-cta'

/**
 * Trang chủ (F10). Mỗi phần là một mảng màu lấy từ mặt sân: thảm cầu lông, sân pickleball,
 * nền vạch phấn, rồi lại xanh thảm ở phần cuối.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVenues />
      <BookingSteps />
      <OwnerCta footnote={<PhotoCredits />} />
    </>
  )
}

function PhotoCredits() {
  const link = 'underline underline-offset-[0.2em] hover:text-white'
  return (
    <p className="max-w-[90ch]">
      Ảnh qua Wikimedia Commons:{' '}
      <a className={link} href="https://commons.wikimedia.org/wiki/File:BLK_0004.jpg">
        “BLK 0004”
      </a>{' '}
      (CC0);{' '}
      <a
        className={link}
        href="https://commons.wikimedia.org/wiki/File:Harry_B._Anderson_Tennis_Center_-_Pickleball_Courts_4-6.jpg"
      >
        “Pickleball Courts 4-6”
      </a>{' '}
      của GA Kevin (CC0);{' '}
      <a
        className={link}
        href="https://commons.wikimedia.org/wiki/File:Hanoi_-_Amsterdam_High_School_football_pitch_1.jpg"
      >
        “Hanoi - Amsterdam High School football pitch 1”
      </a>{' '}
      của Quenhitran (
      <a className={link} href="https://creativecommons.org/licenses/by-sa/3.0">
        CC BY-SA 3.0
      </a>
      ).
    </p>
  )
}

import { createElement, useCallback, type CSSProperties, type HTMLAttributes } from 'react'

type RevealTag = 'div' | 'li' | 'p' | 'span' | 'figure'

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag
  /**
   * `rise`: hiện dần và nhích lên. `line`: trượt lên từ sau mép (đặt trong `.mask-line`).
   * `picture`: mở từ mép trên xuống như rèm.
   * `stage`: bản thân không ẩn, chỉ nhận class `is-in` để các phần tử con tự chạy hiệu ứng.
   */
  variant?: 'rise' | 'line' | 'picture' | 'stage'
  /** Độ trễ (ms) để các phần trong cùng một khối xuất hiện theo thứ tự đọc. */
  delay?: number
}

/**
 * Xuất hiện một lần khi phần tử vào khung nhìn. Trạng thái ẩn chỉ có tác dụng khi `<html>` có class
 * `js` và người dùng không bật giảm chuyển động (xem `app/styles/index.css`), nên nội dung không bao giờ
 * bị kẹt ở trạng thái ẩn.
 */
export function Reveal({ as = 'div', variant = 'rise', delay = 0, style, ...props }: RevealProps) {
  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return
      if (typeof IntersectionObserver === 'undefined') {
        element.classList.add('is-in')
        return
      }
      // `line` nằm khuất sau mép khung cha, `picture` bị clip-path cắt về diện tích 0: Chrome coi cả hai là
      // "không giao" với màn hình nên không bao giờ hiện. Với các kiểu này, theo dõi phần tử cha.
      const target = variant !== 'rise' && element.parentElement ? element.parentElement : element
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            element.classList.add('is-in')
            observer.disconnect()
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
      )
      observer.observe(target)
      return () => observer.disconnect()
    },
    [variant],
  )

  return createElement(as, {
    ref,
    'data-reveal': variant === 'rise' ? '' : variant,
    style: { ...style, '--d': `${delay}ms` } as CSSProperties,
    ...props,
  })
}

import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.locale('vi')

/** Múi giờ nghiệp vụ — use-case-api.md mục 3.1. */
export const BUSINESS_TZ = 'Asia/Ho_Chi_Minh'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatVnd(amount: number) {
  return vndFormatter.format(amount)
}

/** Rút gọn: 120000 → "120k". Dùng cho nhãn giá nhỏ. */
export function formatVndShort(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}tr`
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`
  return `${amount}đ`
}

export function toBusinessTime(iso: string) {
  return dayjs(iso).tz(BUSINESS_TZ)
}

export function formatDateTime(iso: string) {
  return toBusinessTime(iso).format('HH:mm, DD/MM/YYYY')
}

export function formatTimeRange(startIso: string, endIso: string) {
  const start = toBusinessTime(startIso)
  const end = toBusinessTime(endIso)
  return `${start.format('HH:mm')}–${end.format('HH:mm')} · ${start.format('dd, DD/MM')}`
}

export { dayjs }

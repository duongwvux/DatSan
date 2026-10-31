import { cn } from '@/shared/lib/cn'

/**
 * Wordmark DatSan. Bản `compact` là sơ đồ sân nhìn từ trên xuống (đường biên, lưới giữa, ô giao cầu)
 * dùng khi không đủ chỗ cho chữ.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (compact) {
    return (
      <svg viewBox="0 0 32 32" role="img" aria-label="DatSan" className={cn('size-8 shrink-0', className)}>
        <rect width="32" height="32" rx="4" className="fill-court-green" />
        <path d="M7 6h18v20H7z M7 16h18 M16 6v6 M16 20v6" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <span className={cn('text-[1.375rem] leading-none font-semibold tracking-[-0.03em]', className)}>
      DatSan
    </span>
  )
}

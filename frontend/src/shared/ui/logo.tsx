import { cn } from '@/shared/lib/cn'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-extrabold tracking-tight', className)}>
      <svg viewBox="0 0 64 64" aria-hidden className="size-8 shrink-0">
        <rect width="64" height="64" rx="16" className="fill-primary" />
        <rect x="14" y="16" width="36" height="32" rx="3" fill="none" stroke="white" strokeWidth="3" />
        <line x1="32" y1="16" x2="32" y2="48" stroke="white" strokeWidth="3" />
        <circle cx="32" cy="32" r="5" className="fill-brand-accent" />
      </svg>
      {!compact && (
        <span className="text-xl">
          Dat<span className="text-primary">San</span>
        </span>
      )}
    </span>
  )
}

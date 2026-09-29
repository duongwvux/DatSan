import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import type { BookingStatus } from '../model/types'

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  HOLD: { label: 'Đang giữ chỗ', className: 'bg-warning/20 text-foreground border-warning/40' },
  PAID: { label: 'Đã thanh toán', className: 'bg-primary/15 text-primary border-primary/30' },
  COMPLETED: { label: 'Đã chơi', className: 'bg-success/15 text-success border-success/30' },
  EXPIRED: { label: 'Hết hạn', className: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-muted text-muted-foreground' },
  NO_SHOW: { label: 'Không đến', className: 'bg-destructive/10 text-destructive border-destructive/30' },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, className } = STATUS[status]
  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {label}
    </Badge>
  )
}

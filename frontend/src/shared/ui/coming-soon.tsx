import { Construction } from 'lucide-react'
import { EmptyState } from './empty-state'
import { PageHeader } from './page-header'

interface ComingSoonProps {
  title: string
  description?: string
  /** Mã chức năng và người phụ trách, ví dụ "F23, F24 · TV2". */
  owner: string
}

/** Khung giữ chỗ cho trang chưa làm. Xóa khi trang được triển khai. */
export function ComingSoon({ title, description, owner }: ComingSoonProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Đang xây dựng"
        description={<>Phụ trách: <strong className="text-foreground">{owner}</strong></>}
      />
    </div>
  )
}

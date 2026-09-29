import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { Button } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 text-muted-foreground">Trang bạn tìm có thể đã bị di chuyển hoặc không tồn tại.</p>
      <Button asChild className="mt-8">
        <Link to={routes.home}>Về trang chủ</Link>
      </Button>
    </div>
  )
}

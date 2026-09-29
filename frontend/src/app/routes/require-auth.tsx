import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionStore, type Role } from '@/entities/session'
import { routes } from '@/shared/config'

/**
 * Chặn route theo đăng nhập/vai trò để cải thiện trải nghiệm.
 * Đây KHÔNG phải kiểm soát bảo mật — backend luôn kiểm tra quyền (N01).
 */
export function RequireAuth({ roles, children }: { roles?: Role[]; children?: ReactNode }) {
  const { status, user } = useSessionStore()
  const location = useLocation()

  if (status === 'unknown') {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Đang tải" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={routes.login} replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to={routes.home} replace />
  }

  return children ?? <Outlet />
}

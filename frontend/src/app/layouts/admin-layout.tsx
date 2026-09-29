import { FileCheck2, Users } from 'lucide-react'
import { Outlet } from 'react-router'
import { DashboardShell, type DashboardNavItem } from '@/widgets/dashboard-shell'
import { routes } from '@/shared/config'

const NAV: DashboardNavItem[] = [
  { to: routes.admin.ownerApplications, label: 'Duyệt chủ sân', icon: FileCheck2 },
  { to: routes.admin.users, label: 'Người dùng', icon: Users },
]

export function AdminLayout() {
  return (
    <DashboardShell title="Quản trị" nav={NAV}>
      <Outlet />
    </DashboardShell>
  )
}

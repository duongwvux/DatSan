import { CalendarDays, LayoutDashboard, MapPinned } from 'lucide-react'
import { Outlet } from 'react-router'
import { DashboardShell, type DashboardNavItem } from '@/widgets/dashboard-shell'
import { routes } from '@/shared/config'

const NAV: DashboardNavItem[] = [
  { to: routes.owner.root, label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: routes.owner.venues, label: 'Cụm sân & giá', icon: MapPinned },
  { to: routes.owner.schedule, label: 'Lịch đặt', icon: CalendarDays },
]

export function OwnerLayout() {
  return (
    <DashboardShell title="Chủ sân" nav={NAV}>
      <Outlet />
    </DashboardShell>
  )
}

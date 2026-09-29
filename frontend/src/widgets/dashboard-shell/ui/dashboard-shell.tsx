import type { ComponentType, ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { ThemeToggle } from '@/features/toggle-theme'
import { routes } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Logo } from '@/shared/ui'

export interface DashboardNavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

interface DashboardShellProps {
  title: string
  nav: DashboardNavItem[]
  children: ReactNode
}

/** Khung chung cho khu vực chủ sân (TV4) và admin (TV4): sidebar + nội dung. */
export function DashboardShell({ title, nav, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <Link to={routes.home} className="flex h-16 items-center border-b px-5">
          <Logo />
        </Link>
        <p className="px-5 pt-5 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </p>
        <nav className="flex flex-col gap-1 px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Link to={routes.home} className="lg:hidden">
            <Logo compact />
          </Link>
          <nav className="flex gap-1 overflow-x-auto lg:hidden">
            {nav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap',
                    isActive && 'bg-accent font-medium',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

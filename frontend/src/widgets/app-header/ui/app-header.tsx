import { CalendarCheck, LayoutDashboard, LogOut, Menu, ShieldCheck, User } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useCurrentUser } from '@/entities/session'
import { useLogout } from '@/features/auth/logout'
import { ThemeToggle } from '@/features/toggle-theme'
import { routes } from '@/shared/config'
import { cn } from '@/shared/lib'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Logo,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui'

const NAV = [
  { to: routes.venues, label: 'Tìm sân' },
  { to: routes.matches, label: 'Ghép kèo' },
  { to: routes.bookings, label: 'Lịch đặt của tôi' },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function AppHeader() {
  const user = useCurrentUser()
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center gap-6">
        <Link to={routes.home} aria-label="DatSan — Trang chủ">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="size-8">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm sm:inline">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={routes.profile}>
                    <User /> Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={routes.bookings}>
                    <CalendarCheck /> Lịch đặt của tôi
                  </Link>
                </DropdownMenuItem>
                {user.roles.includes('OWNER') && (
                  <DropdownMenuItem asChild>
                    <Link to={routes.owner.root}>
                      <LayoutDashboard /> Quản lý sân
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.roles.includes('ADMIN') && (
                  <DropdownMenuItem asChild>
                    <Link to={routes.admin.root}>
                      <ShieldCheck /> Quản trị
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => logout.mutate()}>
                  <LogOut /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link to={routes.login}>Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to={routes.register}>Đăng ký</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="rounded-md px-3 py-2.5 font-medium hover:bg-accent"
                  >
                    {item.label}
                  </NavLink>
                ))}
                {!user && (
                  <div className="mt-4 grid gap-2">
                    <Button variant="outline" asChild>
                      <Link to={routes.login}>Đăng nhập</Link>
                    </Button>
                    <Button asChild>
                      <Link to={routes.register}>Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

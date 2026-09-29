import { Link, useLocation, useNavigate } from 'react-router'
import { LoginForm } from '@/features/auth/login'
import { routes } from '@/shared/config'
import { Logo } from '@/shared/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? routes.home

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to={routes.home}>
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold">Chào mừng trở lại</h1>
          <p className="mt-2 text-muted-foreground">Đăng nhập để đặt sân và theo dõi lịch chơi.</p>
          <div className="mt-8">
            <LoginForm onSuccess={() => navigate(from, { replace: true })} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link to={routes.register} className="font-medium text-primary hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-brand-panel lg:block">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 size-96 rounded-full bg-brand-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:56px_56px] opacity-10"
        />
        <div className="relative flex h-full flex-col justify-end p-12 text-brand-panel-foreground">
          <blockquote className="max-w-md text-2xl leading-snug font-semibold">
            “Tối thứ 6 nào nhóm mình cũng có sân, chỉ mất 30 giây.”
          </blockquote>
          <p className="mt-4 text-brand-panel-foreground/70">Nhóm cầu lông Cầu Giấy</p>
        </div>
      </div>
    </div>
  )
}

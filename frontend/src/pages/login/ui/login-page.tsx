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
          <h1 className="text-4xl font-semibold tracking-[-0.03em]">Đăng nhập</h1>
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
      <figure className="relative hidden overflow-clip bg-court-green lg:block">
        <img
          src="/images/badminton-hall.jpg"
          alt="Sân cầu lông trong nhà, thảm xanh kẻ vạch trắng, cột lưới số 1, một người ngồi nghỉ trên hàng ghế xanh"
          className="absolute inset-0 size-full object-cover"
        />
      </figure>
    </div>
  )
}

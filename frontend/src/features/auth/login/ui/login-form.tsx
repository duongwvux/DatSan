import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { sessionApi, useSessionStore } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { Button, Input, Label } from '@/shared/ui'
import { loginSchema, type LoginValues } from '../model/login-schema'

/** F02 — TV5 hoàn thiện (Google OAuth2, khóa tạm 5 lần sai). */
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const signIn = useSessionStore((state) => state.signIn)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const login = useMutation({
    mutationFn: async (values: LoginValues) => {
      const { accessToken } = await sessionApi.login(values)
      signIn(accessToken, await sessionApi.getMe())
    },
    onSuccess,
    onError: (error) => {
      const message =
        error instanceof ApiError && error.is('LOGIN_TEMPORARILY_LOCKED')
          ? 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.'
          : error instanceof ApiError && error.is('INVALID_CREDENTIALS')
            ? 'Email hoặc mật khẩu không đúng.'
            : error.message
      form.setError('root', { message })
    },
  })

  const { errors } = form.formState

  return (
    <form onSubmit={form.handleSubmit((values) => login.mutate(values))} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...form.register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...form.register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {errors.root && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
        {login.isPending && <Loader2 className="animate-spin" />}
        Đăng nhập
      </Button>
      <Button variant="outline" className="w-full" size="lg" asChild>
        <a href="/oauth2/authorization/google">Tiếp tục với Google</a>
      </Button>
    </form>
  )
}

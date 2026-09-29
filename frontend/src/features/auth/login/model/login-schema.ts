import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').pipe(z.email('Email không hợp lệ')),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export type LoginValues = z.infer<typeof loginSchema>

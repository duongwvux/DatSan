import type { Uuid } from '@/shared/api'

/** Q02: một tài khoản có tập vai trò; OWNER vẫn giữ PLAYER. */
export type Role = 'PLAYER' | 'OWNER' | 'ADMIN'

export interface CurrentUser {
  id: Uuid
  fullName: string
  email: string
  emailVerified: boolean
  avatarUrl: string | null
  roles: Role[]
}

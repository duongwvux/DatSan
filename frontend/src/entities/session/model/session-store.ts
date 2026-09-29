import { create } from 'zustand'
import { accessTokenStore } from '@/shared/api'
import type { CurrentUser, Role } from './types'

type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

interface SessionState {
  status: SessionStatus
  user: CurrentUser | null
  signIn: (accessToken: string, user: CurrentUser) => void
  setUser: (user: CurrentUser) => void
  signOut: () => void
  markAnonymous: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'unknown',
  user: null,
  signIn: (accessToken, user) => {
    accessTokenStore.set(accessToken)
    set({ status: 'authenticated', user })
  },
  setUser: (user) => set({ status: 'authenticated', user }),
  signOut: () => {
    accessTokenStore.set(null)
    set({ status: 'anonymous', user: null })
  },
  markAnonymous: () => set({ status: 'anonymous', user: null }),
}))

export const useCurrentUser = () => useSessionStore((state) => state.user)

export const useHasRole = (role: Role) =>
  useSessionStore((state) => state.user?.roles.includes(role) ?? false)

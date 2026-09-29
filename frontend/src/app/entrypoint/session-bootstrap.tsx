import { useEffect, type ReactNode } from 'react'
import { sessionApi, useSessionStore } from '@/entities/session'

/**
 * Khi tải trang, thử khôi phục phiên bằng cookie refresh.
 * Không chặn render: trang công khai hiện ngay, route cần đăng nhập chờ `status !== 'unknown'`.
 */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { setUser, markAnonymous } = useSessionStore.getState()
    sessionApi
      .restore()
      .then((user) => (user ? setUser(user) : markAnonymous()))
      .catch(() => markAnonymous())
  }, [])

  return children
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionApi, useSessionStore } from '@/entities/session'

export function useLogout() {
  const signOut = useSessionStore((state) => state.signOut)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => sessionApi.logout(),
    // Luôn xóa phiên phía client, kể cả khi request logout lỗi mạng.
    onSettled: () => {
      signOut()
      queryClient.clear()
    },
  })
}

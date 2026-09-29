import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { queryClient } from '@/shared/api'
import { Toaster, TooltipProvider } from '@/shared/ui'
import { SessionBootstrap } from './session-bootstrap'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <SessionBootstrap>{children}</SessionBootstrap>
          <Toaster richColors position="top-center" />
        </TooltipProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

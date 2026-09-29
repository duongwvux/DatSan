import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { env } from '@/shared/config'
import { AppProviders } from './app-providers'
import { router } from '@/app/routes/router'
import '@/app/styles/index.css'

async function enableMocking() {
  if (!env.enableMocks) return
  const { worker } = await import('@/app/mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})

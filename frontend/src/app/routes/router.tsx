import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { MainLayout } from '@/app/layouts/main-layout'
import { HomePage } from '@/pages/home'
import { RequireAuth } from './require-auth'

/**
 * Bảng route trung tâm. Đường dẫn khớp `shared/config/routes.ts`.
 * Mọi trang trừ trang chủ đều lazy-load để tách bundle (bản đồ, biểu đồ, khu vực chủ sân/admin).
 */
function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return async () => ({ Component: pick(await load()) })
}

const placeholders = () => import('@/pages/placeholders')

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: page(
      () => import('@/pages/login'),
      (m) => m.LoginPage,
    ),
  },
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'venues',
        lazy: page(
          () => import('@/pages/venues'),
          (m) => m.VenuesPage,
        ),
      },
      { path: 'venues/:venueId', lazy: page(placeholders, (m) => m.VenueDetailPage) },
      { path: 'register', lazy: page(placeholders, (m) => m.RegisterPage) },
      { path: 'matches', lazy: page(placeholders, (m) => m.MatchesPage) },
      {
        path: 'me',
        element: <RequireAuth />,
        children: [
          { index: true, lazy: page(placeholders, (m) => m.ProfilePage) },
          { path: 'bookings', lazy: page(placeholders, (m) => m.MyBookingsPage) },
          { path: 'bookings/:bookingId/payment', lazy: page(placeholders, (m) => m.PaymentPage) },
        ],
      },
      {
        path: '*',
        lazy: page(
          () => import('@/pages/not-found'),
          (m) => m.NotFoundPage,
        ),
      },
    ],
  },
  {
    path: '/owner',
    element: <RequireAuth roles={['OWNER']} />,
    children: [
      {
        lazy: page(
          () => import('@/app/layouts/owner-layout'),
          (m) => m.OwnerLayout,
        ),
        children: [
          { index: true, lazy: page(placeholders, (m) => m.OwnerOverviewPage) },
          { path: 'venues', lazy: page(placeholders, (m) => m.OwnerVenuesPage) },
          { path: 'schedule', lazy: page(placeholders, (m) => m.OwnerSchedulePage) },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <RequireAuth roles={['ADMIN']} />,
    children: [
      {
        lazy: page(
          () => import('@/app/layouts/admin-layout'),
          (m) => m.AdminLayout,
        ),
        children: [
          { index: true, lazy: page(placeholders, (m) => m.AdminOwnerApplicationsPage) },
          { path: 'owner-applications', lazy: page(placeholders, (m) => m.AdminOwnerApplicationsPage) },
          { path: 'users', lazy: page(placeholders, (m) => m.AdminUsersPage) },
        ],
      },
    ],
  },
])

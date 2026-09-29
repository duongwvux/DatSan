/** Nguồn duy nhất cho đường dẫn. Không viết cứng chuỗi URL trong component. */
export const routes = {
  home: '/',
  venues: '/venues',
  venueDetail: (venueId: string) => `/venues/${venueId}`,
  login: '/login',
  register: '/register',
  profile: '/me',
  bookings: '/me/bookings',
  bookingPayment: (bookingId: string) => `/me/bookings/${bookingId}/payment`,
  matches: '/matches',
  owner: {
    root: '/owner',
    venues: '/owner/venues',
    schedule: '/owner/schedule',
    statistics: '/owner/statistics',
  },
  admin: {
    root: '/admin',
    ownerApplications: '/admin/owner-applications',
    users: '/admin/users',
  },
} as const

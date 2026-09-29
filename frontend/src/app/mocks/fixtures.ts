import type { CurrentUser } from '@/entities/session'
import type { VenueSummary } from '@/entities/venue'

/** Dữ liệu giả cho dev khi backend chưa sẵn sàng. Ảnh từ Unsplash (chỉ dùng demo). */
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`

export const venues: VenueSummary[] = [
  {
    id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000001',
    name: 'Sân cầu lông Thành Công',
    address: '12 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    sports: ['BADMINTON'],
    coverImageUrl: img('photo-1626224583764-f87db24ac4ea'),
    ratingAverage: 4.8,
    ratingCount: 214,
    minPricePerHour: 80000,
    location: { lat: 21.0245, lng: 105.8095 },
    distanceKm: 1.2,
  },
  {
    id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000002',
    name: 'Pickleball Hub Cầu Giấy',
    address: '88 Trần Thái Tông, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    sports: ['PICKLEBALL'],
    coverImageUrl: img('photo-1693142518820-78d7a05f1546'),
    ratingAverage: 4.7,
    ratingCount: 96,
    minPricePerHour: 150000,
    location: { lat: 21.0333, lng: 105.7896 },
    distanceKm: 3.4,
  },
  {
    id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000003',
    name: 'Sân bóng Mỹ Đình Arena',
    address: '3 Lê Đức Thọ, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    sports: ['FOOTBALL_5', 'FOOTBALL_7'],
    coverImageUrl: img('photo-1575361204480-aadea25e6e68'),
    ratingAverage: 4.6,
    ratingCount: 342,
    minPricePerHour: 300000,
    location: { lat: 21.0205, lng: 105.7638 },
    distanceKm: 6.1,
  },
  {
    id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000004',
    name: 'CLB Cầu lông & Pickleball Hoàng Mai',
    address: '45 Tam Trinh, Hoàng Mai, Hà Nội',
    district: 'Hoàng Mai',
    sports: ['BADMINTON', 'PICKLEBALL'],
    coverImageUrl: null,
    ratingAverage: 4.5,
    ratingCount: 58,
    minPricePerHour: 90000,
    location: { lat: 20.9876, lng: 105.8623 },
    distanceKm: 7.8,
  },
  {
    id: '0b6f2c1e-1a0e-4f7e-9d7c-000000000005',
    name: 'Sân bóng Hồ Tây',
    address: '120 Lạc Long Quân, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    sports: ['FOOTBALL_5'],
    coverImageUrl: img('photo-1529900748604-07564a03e7a6'),
    ratingAverage: 4.4,
    ratingCount: 127,
    minPricePerHour: 250000,
    location: { lat: 21.0583, lng: 105.8103 },
    distanceKm: 4.9,
  },
]

export const demoUser: CurrentUser = {
  id: '5d1e7a2b-0000-4000-8000-000000000001',
  fullName: 'Nguyễn Văn Demo',
  email: 'demo@datsan.vn',
  emailVerified: true,
  avatarUrl: null,
  roles: ['PLAYER', 'OWNER', 'ADMIN'],
}

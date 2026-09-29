import type { ReactNode } from 'react'
import { ComingSoon } from '@/shared/ui'

/**
 * Trang giữ chỗ cho các module chưa làm. Khi bắt đầu module, người phụ trách tạo slice riêng
 * trong `pages/<tên-trang>` và xóa export tương ứng ở đây.
 */

const Container = ({ children }: { children: ReactNode }) => (
  <div className="container-page py-10">{children}</div>
)

export const RegisterPage = () => (
  <Container>
    <ComingSoon title="Đăng ký tài khoản" owner="F01 · TV5" />
  </Container>
)

export const VenueDetailPage = () => (
  <Container>
    <ComingSoon
      title="Chi tiết cụm sân"
      description="Ảnh, bảng giá, lịch trống, đánh giá"
      owner="F13 · TV1 + F20–F22 · TV2"
    />
  </Container>
)

export const ProfilePage = () => (
  <Container>
    <ComingSoon title="Hồ sơ cá nhân" owner="F04, F05 · TV5" />
  </Container>
)

export const MyBookingsPage = () => (
  <Container>
    <ComingSoon title="Lịch đặt của tôi" description="Sắp tới, đã chơi, đã hủy" owner="F23, F24 · TV2" />
  </Container>
)

export const PaymentPage = () => (
  <Container>
    <ComingSoon title="Thanh toán" description="Mã VietQR và đồng hồ giữ chỗ" owner="F30 · TV3" />
  </Container>
)

export const MatchesPage = () => (
  <Container>
    <ComingSoon title="Ghép kèo" owner="F60–F62 · TV5" />
  </Container>
)

export const OwnerOverviewPage = () => (
  <ComingSoon title="Tổng quan" description="Doanh thu, tỷ lệ lấp đầy" owner="F75 · TV4" />
)
export const OwnerVenuesPage = () => <ComingSoon title="Cụm sân & bảng giá" owner="F70–F72 · TV4" />
export const OwnerSchedulePage = () => <ComingSoon title="Lịch đặt theo tuần" owner="F73, F74 · TV4" />

export const AdminOwnerApplicationsPage = () => <ComingSoon title="Duyệt chủ sân" owner="F80 · TV4" />
export const AdminUsersPage = () => <ComingSoon title="Người dùng" owner="F81 · TV4" />

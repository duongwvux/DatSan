# Đặc tả chức năng: Website đặt sân thể thao

**Môn:** Công nghệ Web  
**Nhóm:** 5 thành viên  
**Stack:** React + Vite (frontend), Java Spring Boot (backend), PostgreSQL

**Mức ưu tiên:**

- **Bắt buộc:** phải hoàn thành trong 8 tuần
- **Nên có:** cố gắng hoàn thành
- **Tùy chọn:** chỉ làm nếu dư thời gian

---

## 1. Tác nhân

| Tác nhân | Mô tả |
|---|---|
| Khách | Chưa đăng nhập, chỉ tìm kiếm và xem sân |
| Người chơi (PLAYER) | Đặt sân, thanh toán, đánh giá, ghép kèo |
| Chủ sân (OWNER) | Quản lý cụm sân, bảng giá, lịch đặt, xem thống kê |
| Quản trị viên (ADMIN) | Duyệt chủ sân, quản lý người dùng, xử lý khiếu nại |
| Hệ thống | Các tác vụ chạy tự động theo lịch |

---

## 2. Quy tắc nghiệp vụ cốt lõi

| Mã | Quy tắc |
|---|---|
| R01 | Đơn vị thời gian là 30 phút; mỗi đơn tối thiểu 60 phút, tối đa 4 giờ, trên cùng một sân con |
| R02 | Chỉ đặt trước tối đa 14 ngày; không đặt khung giờ đã qua |
| R03 | Đơn mới tạo được giữ chỗ 5 phút để thanh toán |
| R04 | Mỗi người tối đa 2 đơn đang giữ chỗ cùng lúc (chống giữ chỗ ảo) |
| R05 | Hủy được khi còn từ 24 giờ trở lên trước giờ chơi; dưới 24 giờ không được hủy |
| R06 | Chỉ đơn đã hoàn thành (COMPLETED) mới được đánh giá, mỗi đơn một lần |
| R07 | Mô hình demo: tiền về một tài khoản chung của nền tảng; dashboard chủ sân hiển thị số tiền cần đối soát |

### Vòng đời đơn đặt sân

```
HOLD ──(thanh toán)──> PAID ──(qua giờ chơi)──> COMPLETED
  │                     ├──(hủy ≥ 24h)──> CANCELLED ──> REFUNDED
  │                     └──(không đến)──> NO_SHOW
  └──(quá 5 phút)──> EXPIRED
```

| Trạng thái | Ý nghĩa |
|---|---|
| HOLD | Đang giữ chỗ, chờ thanh toán |
| PAID | Đã thanh toán, khung giờ đã chốt |
| COMPLETED | Đã qua giờ chơi |
| EXPIRED | Quá thời gian giữ chỗ mà chưa thanh toán |
| CANCELLED | Người chơi hủy, chờ hoàn tiền |
| REFUNDED | Chủ sân đã hoàn tiền |
| NO_SHOW | Khách không đến |

Đơn do chủ sân tạo tại quầy (khách gọi điện hoặc đến trực tiếp, trả tiền mặt) đi thẳng vào PAID với phương thức CASH.

---

## 3. Chức năng chi tiết

### 3.1. Tài khoản — TV5

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F01 | Đăng ký | Họ tên, email, số điện thoại, mật khẩu tối thiểu 8 ký tự; xác thực email bằng OTP hoặc link | Bắt buộc |
| F02 | Đăng nhập | Email/mật khẩu hoặc Google; access token 15 phút, refresh token 7 ngày; sai mật khẩu 5 lần thì khóa tạm 15 phút | Bắt buộc |
| F03 | Quên mật khẩu | Gửi link đặt lại qua email, hết hạn sau 15 phút, chỉ dùng một lần | Bắt buộc |
| F04 | Hồ sơ cá nhân | Ảnh đại diện, số điện thoại, khu vực, môn chơi ưa thích, trình độ (dùng cho ghép kèo); đổi mật khẩu | Bắt buộc |
| F05 | Đăng ký làm chủ sân | Gửi tên cơ sở, địa chỉ, số điện thoại, ảnh giấy tờ; chờ admin duyệt | Bắt buộc |

### 3.2. Tìm kiếm và xem sân — TV1

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F10 | Trang chủ | Sân nổi bật, sân gần bạn (nếu cho phép lấy vị trí), lối tắt theo môn | Bắt buộc |
| F11 | Tìm kiếm và lọc | Theo từ khóa, môn, quận/huyện, khoảng giá, ngày và khung giờ còn trống, tiện ích; sắp xếp theo khoảng cách, giá, điểm đánh giá; phân trang | Bắt buộc |
| F12 | Bản đồ | Hiển thị kết quả trên bản đồ, bấm điểm đánh dấu xem tóm tắt, nút mở chỉ đường Google Maps | Bắt buộc |
| F13 | Chi tiết cụm sân | Ảnh, mô tả, giờ mở cửa, tiện ích, bảng giá, danh sách sân con, vị trí, đánh giá | Bắt buộc |
| F14 | Sân yêu thích | Lưu sân để đặt lại nhanh | Nên có |

### 3.3. Đặt sân — TV2

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F20 | Lịch trống | Lưới "sân con × khung giờ" theo ngày, màu theo trạng thái (trống, đang giữ, đã đặt, đã qua giờ); cập nhật realtime | Bắt buộc |
| F21 | Chọn khung giờ | Chọn nhiều ô liên tiếp trên cùng một sân, hiển thị tổng tiền tạm tính | Bắt buộc |
| F22 | Tạo đơn và giữ chỗ | Tạo đơn HOLD; hai người bấm cùng lúc thì chỉ một người thành công, người còn lại nhận thông báo "khung giờ vừa có người đặt" | Bắt buộc |
| F23 | Lịch sử đặt | Danh sách chia theo sắp tới, đã chơi, đã hủy; xem chi tiết đơn | Bắt buộc |
| F24 | Hủy đơn | Theo quy tắc R05; đơn đã thanh toán chuyển sang chờ hoàn tiền | Bắt buộc |
| F25 | Mã check-in | Mỗi đơn có mã QR riêng, chủ sân quét khi khách đến | Nên có |
| F26 | Đổi lịch | Đổi sang khung khác trong cùng cụm sân, tối đa một lần, còn từ 24 giờ; giá mới cao hơn thì thanh toán phần chênh | Nên có |
| F27 | Đặt định kỳ | Đặt cùng khung giờ hàng tuần trong nhiều tuần liên tiếp | Tùy chọn |

### 3.4. Thanh toán — TV3

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F30 | Thanh toán QR | Mã VietQR có sẵn số tiền và nội dung là mã đơn, đồng hồ đếm ngược thời gian giữ chỗ; tự chuyển trang khi nhận được tiền | Bắt buộc |
| F31 | Xác nhận tự động qua webhook | Khớp mã đơn và số tiền rồi chuyển đơn sang PAID. Chuyển thiếu thì đánh dấu "thanh toán thiếu"; chuyển sau khi đơn hết hạn thì ghi nhận "cần hoàn tiền"; webhook gửi lặp thì bỏ qua | Bắt buộc |
| F32 | VNPay sandbox | Phương thức thứ hai: chuyển hướng sang cổng VNPay, xử lý Return URL và IPN, kiểm tra chữ ký | Nên có |
| F33 | Biên nhận | Xem biên nhận điện tử của đơn đã thanh toán | Nên có |
| F34 | Đặt cọc | Chủ sân chọn thu toàn bộ hay chỉ cọc một phần, phần còn lại trả tại sân | Tùy chọn |

### 3.5. Thông báo — TV3

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F40 | Email | Xác nhận đặt thành công, nhắc lịch trước giờ chơi 2 giờ, thông báo hủy đơn | Bắt buộc |
| F41 | Thông báo trong app | Biểu tượng chuông cập nhật realtime, đánh dấu đã đọc | Bắt buộc |
| F42 | Thông báo cho chủ sân | Khi có đơn mới, đơn bị hủy, đánh giá mới | Bắt buộc |

### 3.6. Đánh giá — TV1

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F50 | Viết đánh giá | 1 đến 5 sao, nội dung, ảnh tùy chọn; theo quy tắc R06; được sửa trong 7 ngày | Bắt buộc |
| F51 | Phản hồi đánh giá | Chủ sân trả lời đánh giá | Nên có |
| F52 | Báo cáo vi phạm | Gửi đánh giá vi phạm lên admin xem xét | Nên có |

### 3.7. Ghép kèo — TV5

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F60 | Tạo kèo | Từ một đơn đã thanh toán: số người cần thêm, trình độ mong muốn, số tiền mỗi người góp, ghi chú. Tiền góp do thành viên tự trả cho chủ kèo, hệ thống chỉ hiển thị | Nên có |
| F61 | Danh sách kèo | Lọc theo môn, khu vực, thời gian, trình độ | Nên có |
| F62 | Tham gia kèo | Xin tham gia, chủ kèo duyệt hoặc từ chối; đủ người thì kèo tự đóng | Nên có |
| F63 | Nhắn tin trong kèo | Chat realtime giữa các thành viên | Tùy chọn |

### 3.8. Chủ sân — TV4

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F70 | Quản lý cụm sân | Thêm, sửa, ẩn/hiện; ảnh, địa chỉ và tọa độ (chọn trên bản đồ), giờ mở cửa, tiện ích | Bắt buộc |
| F71 | Quản lý sân con | Tên, loại sân (cầu lông, pickleball, bóng đá 5 hoặc 7 người), trạng thái hoạt động hoặc bảo trì | Bắt buộc |
| F72 | Bảng giá | Giá theo khung giờ và ngày trong tuần, giá ngày lễ; quy tắc cụ thể hơn được ưu tiên khi chồng nhau | Bắt buộc |
| F73 | Đơn tại quầy và khóa lịch | Tạo đơn thủ công cho khách gọi điện hoặc đến trực tiếp; chặn khung giờ khi bảo trì. Tránh trùng lịch giữa khách online và offline | Bắt buộc |
| F74 | Lịch đặt dạng tuần | Xem tất cả sân con trên một màn hình, chi tiết đơn, xác nhận check-in, đánh dấu khách không đến | Bắt buộc |
| F75 | Dashboard | Doanh thu theo ngày, tuần, tháng; tỷ lệ lấp đầy theo khung giờ dạng bản đồ nhiệt; sân con được đặt nhiều nhất; tỷ lệ hủy | Bắt buộc |
| F76 | Hoàn tiền | Danh sách đơn chờ hoàn, đánh dấu đã hoàn sau khi chuyển khoản trả khách | Nên có |
| F77 | Xuất báo cáo Excel | Xuất số liệu dashboard ra file Excel | Tùy chọn |

### 3.9. Quản trị viên — TV4

| Mã | Chức năng | Mô tả | Mức |
|---|---|---|---|
| F80 | Duyệt chủ sân | Xem hồ sơ, chấp nhận hoặc từ chối kèm lý do | Bắt buộc |
| F81 | Quản lý người dùng | Tìm kiếm, khóa và mở khóa tài khoản | Bắt buộc |
| F82 | Kiểm duyệt nội dung | Ẩn cụm sân vi phạm, xử lý đánh giá bị báo cáo | Nên có |
| F83 | Khiếu nại | Người chơi gửi khiếu nại về một đơn; admin xử lý theo trạng thái mới, đang xử lý, đã xong | Nên có |
| F84 | Thống kê hệ thống | Người dùng mới, số đơn, tổng giao dịch theo thời gian | Nên có |
| F85 | Nhật ký thanh toán | Xem dữ liệu webhook thô, phục vụ gỡ lỗi và demo | Nên có |

### 3.10. Tác vụ tự động

| Mã | Tác vụ | Tần suất | Phụ trách |
|---|---|---|---|
| S01 | Hủy đơn HOLD quá 5 phút, mở lại khung giờ | Mỗi 30 giây | TV2 |
| S02 | Chuyển đơn PAID sang COMPLETED sau giờ kết thúc | Mỗi 5 phút | TV2 |
| S03 | Gửi email nhắc lịch trước giờ chơi 2 giờ | Mỗi 5 phút | TV3 |
| S04 | Đóng các kèo đã qua giờ chơi | Mỗi 15 phút | TV5 |

---

## 4. Yêu cầu phi chức năng

| Mã | Nhóm | Yêu cầu |
|---|---|---|
| N01 | Bảo mật | Mật khẩu băm bằng BCrypt; toàn bộ hệ thống chạy HTTPS; kiểm tra quyền ở backend, không chỉ ẩn nút ở frontend |
| N02 | Bảo mật | Giới hạn tần suất request cho đăng nhập và tạo đơn; kiểm tra dữ liệu đầu vào ở mọi API |
| N03 | Hiệu năng | API thông thường phản hồi dưới 500 ms |
| N04 | Realtime | Thay đổi lịch trống tới người xem khác trong vòng 1–2 giây |
| N05 | Toàn vẹn dữ liệu | Không bao giờ có hai đơn hợp lệ trên cùng một sân con và khung giờ |
| N06 | Giao diện | Dùng tốt trên điện thoại (responsive), cài được dạng PWA |

---

## 5. Tổng hợp theo người phụ trách

| Thành viên | Bắt buộc | Nên có | Tùy chọn | Tác vụ tự động |
|---|---|---|---|---|
| TV1 | F10, F11, F12, F13, F50 | F14, F51, F52 | — | — |
| TV2 | F20, F21, F22, F23, F24 | F25, F26 | F27 | S01, S02 |
| TV3 | F30, F31, F40, F41, F42 | F32, F33 | F34 | S03 |
| TV4 | F70, F71, F72, F73, F74, F75, F80, F81 | F76, F82, F83, F84, F85 | F77 | — |
| TV5 | F01, F02, F03, F04, F05 | F60, F61, F62 | F63 | S04 |

TV4 có nhiều chức năng bắt buộc hơn nhưng phần lớn là thêm/sửa/xóa và truy vấn thống kê, độ khó kỹ thuật thấp hơn các phần đặt sân, thanh toán, bảo mật. TV5 ngoài các chức năng trên còn phụ trách khung dự án, CI/CD, triển khai và điều phối nhóm.

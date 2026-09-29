# Kế hoạch đồ án: Website đặt sân thể thao (Backend Java)

**Môn:** Công nghệ Web  
**Nhóm:** 5 thành viên  
**Thời gian:** 8 tuần (28/9 – 22/11), dự phòng 23/11 – 26/11

---

## 1. Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot, Spring Web, Spring Data JPA (Hibernate), Spring Security + JWT, OAuth2 (Google), Spring WebSocket (STOMP), Spring Mail, Flyway, Bean Validation, Bucket4j, springdoc-openapi |
| Frontend | React + Vite + TypeScript theo Feature-Sliced Design, React Router, TanStack Query, Axios, Tailwind CSS + shadcn/ui, react-hook-form + zod, Zustand, @stomp/stompjs, Leaflet + OpenStreetMap, Recharts, MSW, vite-plugin-pwa |
| Cơ sở dữ liệu | PostgreSQL |
| Thanh toán | VietQR + SePay (webhook), VNPay sandbox |
| Kiểm thử | JUnit 5, Mockito, Testcontainers, MockMvc, JaCoCo, k6, Playwright |
| Triển khai | Docker, Docker Compose, GitHub Actions, VPS hoặc Railway |

---

## 2. Phân vai

Mỗi người làm **cả backend lẫn frontend** cho module của mình (chia theo lát cắt dọc), để không ai phải ngồi chờ người khác.

| Thành viên | Vai trò | Backend | Frontend |
|---|---|---|---|
| TV1 | Frontend lead + Tìm kiếm & đánh giá | API tìm kiếm, lọc, phân trang; API đánh giá | Khung dự án React, bộ component chung, trang chủ, tìm kiếm, bản đồ, chi tiết sân, PWA |
| TV2 | Lõi đặt sân | Khung giờ trống, tạo đơn, khóa chỗ, chống trùng, WebSocket, tác vụ hủy đơn quá hạn | Component chọn khung giờ, lịch sử đặt, hủy/đổi lịch |
| TV3 | Thanh toán & thông báo | VietQR, webhook SePay, VNPay sandbox, email, thông báo trong app | Màn hình thanh toán QR, kết quả thanh toán, trung tâm thông báo |
| TV4 | Chủ sân & admin | CRUD cụm sân/sân con, upload ảnh, bảng giá, dịch vụ tính giá, thống kê, admin | Trang quản lý sân, bảng giá, lịch tuần, dashboard, trang admin |
| TV5 | Trưởng nhóm, Backend lead, DevOps | Khung dự án Spring Boot, xử lý lỗi chung, Spring Security, JWT, OAuth2, ghép kèo, rate limit | Đăng nhập/đăng ký, hồ sơ, ghép kèo; CI/CD, Docker, deploy, test E2E |

---

## 3. Mốc quan trọng

| Mốc | Ngày | Tiêu chí hoàn thành |
|---|---|---|
| Mốc 0 | 04/10 | Đặc tả OpenAPI được cả nhóm duyệt; hai khung dự án chạy được bằng `docker compose up` |
| Mốc 1 | 25/10 | Demo trọn luồng trên staging: tìm sân → chọn giờ → quét QR trả tiền thật → đơn chuyển "đã thanh toán" |
| Mốc 2 | 08/11 | Khóa tính năng, từ đây chỉ sửa lỗi |
| Hoàn thành | 22/11 | Bản chính thức chạy ổn định, báo cáo và slide hoàn chỉnh |

---

## 4. Kế hoạch theo tuần

### Tuần 1 (28/9 – 4/10): Phân tích, thiết kế, đặc tả API

- [ ] **Cả nhóm:** chốt danh sách chức năng, vẽ use case, thống nhất quy trình Git và quy ước API (mục 6)
- [ ] **Cả nhóm:** mỗi người viết đặc tả OpenAPI cho các API thuộc module của mình; TV5 gộp và tổ chức buổi duyệt
- [ ] **TV1:** wireframe màn hình người chơi trên Figma, chọn màu và font; khởi tạo dự án React + Vite + TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, Axios client có interceptor gắn JWT _(khung dự án đã khởi tạo trong `frontend/`, gồm cả MSW và design tokens; còn wireframe Figma)_
- [ ] **TV2:** thiết kế ERD (User, Venue, Court, PriceRule, Booking, Payment, Review, Match, Notification); viết script Flyway `V1__init.sql`; phân tích bài toán tranh chấp khung giờ và chọn cơ chế khóa
- [ ] **TV3:** đăng ký SePay sandbox và VNPay sandbox ngay (phải chờ kích hoạt); tìm hiểu định dạng VietQR; vẽ sequence diagram luồng thanh toán
- [ ] **TV4:** wireframe màn hình chủ sân và admin; đặc tả quy tắc tính giá (giờ cao điểm, cuối tuần, ngày lễ)
- [ ] **TV5:** khởi tạo Spring Boot (Java 21, Maven), cấu trúc package theo module, `docker-compose.yml` (PostgreSQL, backend, frontend), `GlobalExceptionHandler` với định dạng lỗi chuẩn, cấu hình springdoc, tạo bảng GitHub Projects

> 🏁 **Mốc 0 (4/10):** đặc tả API được duyệt, `docker compose up` chạy được cả hệ thống rỗng.

### Tuần 2 (5/10 – 11/10): Nền tảng

- [ ] **TV1:** layout chung, header/footer, trang chủ, bộ component dùng chung; dựng dữ liệu giả bằng MSW theo đặc tả OpenAPI để frontend không phải chờ backend
- [ ] **TV2:** entity và repository cho Court, Booking; dữ liệu mẫu (khoảng 10 cụm sân); API `GET /api/v1/courts/{id}/availability?date=` trả khung giờ trống
- [ ] **TV3:** service sinh mã VietQR theo đơn; endpoint `POST /api/v1/payments/sepay/webhook` dạng khung, chạy thử qua ngrok, lưu dữ liệu webhook thô vào bảng log
- [ ] **TV4:** API CRUD cụm sân và sân con (chỉ vai trò OWNER), upload ảnh; màn hình quản lý sân
- [ ] **TV5:** đăng ký/đăng nhập bằng JWT (access + refresh token), đăng nhập Google OAuth2, phân quyền PLAYER/OWNER/ADMIN bằng `@PreAuthorize`; màn hình đăng nhập/đăng ký; GitHub Actions chạy build và test cho cả backend lẫn frontend

### Tuần 3 (12/10 – 18/10): Chức năng lõi, phần 1

- [ ] **TV1:** API tìm kiếm có lọc (môn, khu vực, giá, giờ trống) bằng JPA Specification và phân trang; giao diện tìm kiếm và bản đồ Leaflet
- [ ] **TV2:** API `POST /api/v1/bookings` tạo đơn trạng thái HOLD giữ chỗ 5 phút; chống trùng bằng `@Transactional` + ràng buộc unique (court, ngày, khung giờ) + khóa lạc quan `@Version`; viết test tranh chấp bằng JUnit và `ExecutorService`
- [ ] **TV3:** xử lý webhook SePay: xác thực chữ ký, tách mã đơn từ nội dung chuyển khoản, kiểm tra số tiền, chống ghi nhận trùng theo mã giao dịch, cập nhật Payment và Booking
- [ ] **TV4:** entity PriceRule và `PricingService` tính giá cho một lượt đặt (TV2 gọi); giao diện cấu hình bảng giá
- [ ] **TV5:** trang hồ sơ người dùng (backend + frontend); deploy staging tự động từ nhánh `dev`

### Tuần 4 (19/10 – 25/10): Chức năng lõi, phần 2 + ghép luồng

- [ ] **TV1:** trang chi tiết sân; ghép component chọn khung giờ của TV2 vào trang
- [ ] **TV2:** WebSocket STOMP phát sự kiện khi khung giờ đổi trạng thái (topic `/topic/courts/{id}/{date}`); `@Scheduled` tự hủy đơn HOLD quá hạn; frontend subscribe để lịch tự cập nhật
- [ ] **TV3:** màn hình thanh toán QR có đếm ngược; nhận sự kiện "đã thanh toán" qua WebSocket (dùng hạ tầng của TV2) để tự chuyển trang
- [ ] **TV4:** API và giao diện lịch đặt dạng tuần cho chủ sân; xác nhận/hủy đơn thủ công
- [ ] **TV5:** điều phối ghép nối, review PR; viết test tích hợp luồng đặt – thanh toán bằng Testcontainers + MockMvc

> 🏁 **Mốc 1 (25/10):** demo trọn luồng tìm sân → chọn giờ → quét QR trả tiền thật → đơn "đã thanh toán" trên staging.

### Tuần 5 (26/10 – 1/11): Mở rộng

- [ ] **TV1:** API và giao diện đánh giá sân (chỉ người có đơn đã hoàn thành mới được đánh giá), tính điểm trung bình
- [ ] **TV2:** hủy/đổi lịch theo chính sách (ví dụ chỉ hủy trước 24 giờ); trang lịch sử đặt của người chơi
- [ ] **TV3:** tích hợp VNPay sandbox: tạo URL thanh toán, xử lý Return URL và IPN, kiểm tra chữ ký HMAC-SHA512
- [ ] **TV4:** API thống kê doanh thu, tỷ lệ lấp đầy theo khung giờ (truy vấn tổng hợp); dashboard biểu đồ bằng Recharts
- [ ] **TV5:** ghép kèo (backend + frontend): tạo kèo gắn với một đơn đặt, người khác xin tham gia, chủ kèo duyệt

### Tuần 6 (2/11 – 8/11): Hoàn thiện tính năng

- [ ] **TV1:** PWA bằng vite-plugin-pwa (cài được lên điện thoại), tối ưu giao diện mobile
- [ ] **TV2:** kiểm thử tải bằng k6: 100 request đồng thời vào cùng một khung giờ, chứng minh chỉ đúng 1 đơn thành công; bật virtual threads (`spring.threads.virtual.enabled=true`) và so sánh thông lượng trước/sau
- [ ] **TV3:** email nhắc lịch bằng Spring Mail (`@Scheduled` quét đơn sắp diễn ra); thông báo trong app khi đơn đổi trạng thái
- [ ] **TV4:** trang admin: duyệt chủ sân mới, xử lý khiếu nại, khóa tài khoản
- [ ] **TV5:** realtime cho ghép kèo (dùng lại WebSocket của TV2); giới hạn tần suất request bằng Bucket4j; rà soát Bean Validation và cấu hình CORS

> 🏁 **Mốc 2 (8/11):** khóa tính năng, từ đây chỉ sửa lỗi.

### Tuần 7 (9/11 – 15/11): Kiểm thử chéo

- [ ] **Cả nhóm:** kiểm thử module của người khác theo vòng TV1 → TV2 → TV3 → TV4 → TV5 → TV1, ghi lỗi lên GitHub Issues
- [ ] **Cả nhóm:** mỗi người bổ sung unit test cho các service của mình, mục tiêu độ phủ backend từ 60% trở lên (đo bằng JaCoCo)
- [ ] **TV5:** viết test E2E bằng Playwright cho 3 luồng chính (đặt sân, thanh toán, chủ sân xác nhận đơn)
- [ ] **TV1:** rà soát giao diện lần cuối, kiểm tra trên nhiều kích thước màn hình
- [ ] **Cả nhóm:** bắt đầu viết chương báo cáo cho module của mình

### Tuần 8 (16/11 – 22/11): Đóng gói & bảo vệ

- [ ] **TV5:** deploy bản chính thức, gắn tên miền, HTTPS; chốt Swagger UI công khai để demo
- [ ] **TV2 + TV4:** nạp dữ liệu demo (ảnh sân thật, lịch sử đặt khoảng 1 tháng để dashboard có số liệu)
- [ ] **TV3:** soạn kịch bản demo thanh toán thật và phương án dự phòng nếu mạng lỗi
- [ ] **TV1:** làm slide, quay video demo dự phòng
- [ ] **Cả nhóm:** ghép báo cáo, tổng duyệt ít nhất 2 lần, mỗi người chuẩn bị trả lời câu hỏi về phần mình

---

## 5. Cấu trúc dự án

> **Hiện trạng repo (29/09):** khung Spring Boot đang nằm ở **gốc repo** (`pom.xml`, `src/`, package `vn.datsan.backend`), chưa nằm trong `backend/`. Frontend nằm trong `frontend/`. Đề xuất TV5 chuyển backend vào `backend/` trước Mốc 0 để hai dự án tách bạch (đường dẫn build trong Docker và GitHub Actions gọn hơn); nếu giữ ở gốc thì cập nhật lại cây bên dưới cho khớp.

```
dat-san/
├── backend/                  # Spring Boot (hiện đang ở gốc repo, xem ghi chú trên)
│   └── src/main/java/vn/datsan/backend/
│       ├── common/           # TV5: cấu hình, xử lý lỗi, tiện ích
│       ├── auth/             # TV5: đăng nhập, JWT, OAuth2
│       ├── user/             # TV5
│       ├── match/            # TV5: ghép kèo
│       ├── search/           # TV1
│       ├── review/           # TV1
│       ├── booking/          # TV2
│       ├── realtime/         # TV2: WebSocket
│       ├── payment/          # TV3
│       ├── notification/     # TV3
│       ├── venue/            # TV4: cụm sân, sân con, bảng giá
│       ├── stats/            # TV4
│       └── admin/            # TV4
├── frontend/                 # React + Vite, tổ chức theo Feature-Sliced Design
│   └── src/
│       ├── app/              # TV1: entrypoint, providers, router, layout, design tokens, mock API
│       ├── pages/            # mỗi trang một slice; người làm trang nào sở hữu slice đó
│       ├── widgets/          # khối UI lớn: header, footer, khung dashboard…
│       ├── features/         # hành động nghiệp vụ: đăng nhập, chọn khung giờ, thanh toán QR…
│       ├── entities/         # session, venue, booking, payment, review…
│       └── shared/           # TV1: ui kit (shadcn), Axios client, config, realtime, tiện ích
├── docs/                     # đặc tả OpenAPI, ERD, báo cáo
└── docker-compose.yml
```

Mỗi module backend theo cấu trúc `controller` → `service` → `repository`, cộng `dto` và `entity`.

Frontend chia theo **tầng FSD** chứ không chia theo người: một thành viên thường có slice ở nhiều tầng (ví dụ TV2 sở hữu `entities/booking`, `features/select-time-slots`, `features/create-booking`, `pages/my-bookings`). Quy tắc import, bảng slice theo người và quy ước code nằm ở `frontend/README.md`; `npm run lint:fsd` kiểm tra tự động trong CI.

---

## 6. Quy ước chung

- **API:** tiền tố `/api/v1`, tên tài nguyên số nhiều (`/bookings`, `/courts`), dùng DTO, không trả entity trực tiếp.
- **Định dạng lỗi:** `{ "code": "BOOKING_SLOT_TAKEN", "message": "...", "timestamp": "..." }`, do `GlobalExceptionHandler` xử lý tập trung.
- **Git:** nhánh `main` (bản ổn định), `dev` (tích hợp), nhánh tính năng đặt tên `feature/tv2-booking-hold`; không merge khi PR chưa có 1 người review và CI chưa xanh.
- **Commit:** theo Conventional Commits, ví dụ `feat(booking): add slot hold`, `fix(payment): verify webhook signature`.
- **Họp:** họp nhanh 15 phút, 2 lần mỗi tuần; cuối tuần có 1 buổi demo tiến độ.
- **Đường găng:** TV2 (đặt sân) và TV3 (thanh toán). Nếu giữa tuần 4 có dấu hiệu trễ Mốc 1, TV5 hỗ trợ ngay vì mọi phần sau đều phụ thuộc vào luồng đặt – thanh toán.

---

## 7. Gợi ý phân chương báo cáo

| Chương | Nội dung | Người viết |
|---|---|---|
| 1 | Giới thiệu bài toán, khảo sát thực tế | TV5 |
| 2 | Phân tích yêu cầu, use case, thiết kế cơ sở dữ liệu | TV2 |
| 3 | Kiến trúc hệ thống (React + Spring Boot), bảo mật, triển khai | TV5 |
| 4 | Giao diện, trải nghiệm người dùng, tìm kiếm, PWA | TV1 |
| 5 | Luồng đặt sân, chống trùng, realtime, kiểm thử tải | TV2 |
| 6 | Thanh toán QR, webhook, VNPay, thông báo | TV3 |
| 7 | Quản lý chủ sân, bảng giá, dashboard, admin | TV4 |
| 8 | Kiểm thử, đánh giá, hướng phát triển | Cả nhóm |

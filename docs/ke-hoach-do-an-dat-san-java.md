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
| Thanh toán | VietQR + SePay (webhook) |
| Kiểm thử | JUnit 5, Mockito, Testcontainers, MockMvc, JaCoCo, k6, Playwright |
| Triển khai | Docker, Docker Compose, GitHub Actions, VPS hoặc Railway |

---

## 2. Phân vai

Mỗi người làm **cả backend lẫn frontend** cho module của mình (chia theo lát cắt dọc), để không ai phải ngồi chờ người khác.

| Thành viên | Vai trò | Backend | Frontend |
|---|---|---|---|
| TV1 | Frontend lead + Tìm kiếm & đánh giá | API tìm kiếm, lọc, phân trang; API đánh giá | Khung dự án React, bộ component chung, trang chủ, tìm kiếm, bản đồ, chi tiết sân, PWA |
| TV2 | Lõi đặt sân | Khung giờ trống, tạo đơn, khóa chỗ, chống trùng, WebSocket, tác vụ hủy đơn quá hạn | Component chọn khung giờ, lịch sử đặt, hủy đơn |
| TV3 | Thanh toán & thông báo | VietQR, webhook SePay, ghi nhận hoàn tiền, email, thông báo trong app | Màn hình thanh toán QR, kết quả thanh toán, trung tâm thông báo |
| TV4 | Chủ sân & admin | CRUD cụm sân/sân con, upload ảnh, bảng giá, dịch vụ tính giá, thống kê, admin | Trang quản lý sân, bảng giá, lịch tuần, dashboard, trang admin |
| TV5 | Trưởng nhóm, Backend lead, DevOps | Khung dự án Spring Boot, xử lý lỗi chung, Spring Security, JWT, OAuth2, rate limit | Đăng nhập/đăng ký, hồ sơ; CI/CD, Docker, deploy, test E2E |

---

## 3. Mốc quan trọng

| Mốc | Ngày | Tiêu chí hoàn thành |
|---|---|---|
| Mốc 0 | 04/10 | Đặc tả OpenAPI được cả nhóm duyệt; hai khung dự án chạy được bằng `docker compose up` |
| Mốc 1 | 25/10 | Demo trọn luồng trên staging: tìm sân → chọn giờ → quét QR trả tiền thật → đơn chuyển "đã thanh toán" |
| Mốc 2 | 08/11 | Khóa tính năng, từ đây chỉ sửa lỗi. Ngày 14/11 rút gọn phạm vi: bỏ ghép kèo, VNPay, đổi lịch, khiếu nại và các mục nên có/tùy chọn khác (mục 11 `use-case-api.md`) |
| Baseline v3 | 16/11 | Nhóm thay mô hình nghiệp vụ bằng bộ tài liệu v3 (BRC, Role Matrix, State Machine, Use Case Spec, ERD v1.1). `use-case-api.md` (20/11) phân công và chia mức ưu tiên cho 21 use case theo baseline này; các việc theo tuần ở mục 4 viết trước 16/11, chỗ nào mâu thuẫn thì theo v3 |
| Hoàn thành | 22/11 | Bản chính thức chạy ổn định, báo cáo và slide hoàn chỉnh |

---

## 3a. Tiến độ thực tế (cập nhật 19/11/2026)

Đánh giá theo mã nguồn trên repo (`main` và nhánh `tv5-exception/backend`, gồm cả phần chưa commit của TV5). Việc thành viên làm ở máy riêng mà chưa đẩy lên thì chưa được tính — mỗi người tự bổ sung vào bảng.

| Thành viên | Đã có trên repo | Chưa có |
|---|---|---|
| TV1 | Khung frontend React + Vite + TS (FSD, Tailwind, shadcn/ui, TanStack Query, Axios, MSW, PWA plugin); trang chủ thiết kế lại, trang danh sách sân, trang đăng nhập; router có layout Member/Owner/Admin và trang giữ chỗ | API tìm kiếm/đánh giá; trang chi tiết sân, bản đồ, đăng ký; wireframe Figma. Route `matches` (ghép kèo) còn trong router dù đã ngoài phạm vi |
| TV2 | — (ERD logic v1.1 đã có ở `docs/`, ngày 16/11) | Entity/migration booking, API lịch trống, tạo đơn, chống trùng, WebSocket, tác vụ hết hạn |
| TV3 | — | VietQR, webhook SePay, hoàn tiền, email, thông báo |
| TV4 | — | CRUD Venue/Court, bảng giá, khoảng chặn, dashboard, admin |
| TV5 | Spring Boot Java 21 trong `backend/`; `common/exception` (định dạng lỗi chung, traceId, handler cho lỗi security); auth: đăng ký + xác thực email, đăng nhập mật khẩu, khóa tạm 5 lần sai, Google OAuth2, access JWT + refresh cookie xoay vòng, CSRF/Origin, quên/đổi mật khẩu, `GET /users/me`; migration `V1__auth_user.sql`; test tích hợp auth (H2); `docker-compose.yml` chỉ có PostgreSQL | Merge phần auth vào `main`; đổi auth/user theo Q02/Q03 của `use-case-api.md` (vai trò `MEMBER`, trường đăng ký mới); `PATCH /users/me`; API hồ sơ Owner; upload; GitHub Actions; Docker Compose đủ backend + frontend; springdoc; Bucket4j; deploy staging; E2E |

**Mốc chưa đạt:** Mốc 0 (OpenAPI chưa có `docs/openapi.yaml`, Compose chưa chạy cả hệ thống), Mốc 1 (chưa có luồng đặt – thanh toán), Mốc 2.

**Rủi ro:** còn 3 ngày tới 22/11 (dự phòng tới 26/11) trong khi luồng lõi đặt sân – thanh toán – duyệt chưa có code, và baseline v3 mở rộng phạm vi so với bản rút gọn 14/11. Cần họp chốt ngay mức ưu tiên và thứ tự cắt giảm ở mục 1 của `use-case-api.md`.

### Việc còn lại theo baseline v3 (19/11 – 26/11)

Phạm vi: 21 use case theo `use-case-api.md` mục 1 (bắt buộc G1–G6, nên có G7).

- [ ] **Cả nhóm:** duyệt `use-case-api.md`: phạm vi, mức ưu tiên, Q01–Q21
- [ ] **TV5:** merge auth vào `main`; đổi `PLAYER` → `MEMBER`, trường đăng ký theo Q03; `PATCH /users/me`; API hồ sơ Owner + upload; GitHub Actions; Compose đủ hệ thống; deploy staging
- [ ] **TV2:** migration booking (bookings, booking_invoices, booking_guest_details, booking_status_events + ràng buộc chống chồng khoảng); tạo HOLD; đặt hộ Guest; duyệt/từ chối/hủy/chốt kết quả; tác vụ A1–A3; WebSocket lịch
- [ ] **TV3:** yêu cầu thanh toán + VietQR, webhook SePay, tiền thực nhận, hoàn tiền (chủ sân và thành viên xác nhận, quản trị viên xử lý quá hạn); tác vụ A4–A6; thông báo
- [ ] **TV4:** Venue/Court/giờ mở cửa/bảng giá/khoảng chặn, PricingService; duyệt hồ sơ Owner, khóa tài khoản; giao diện chủ sân duyệt đơn, đặt hộ Guest, chốt kết quả, hoàn tiền; dashboard và hoa hồng
- [ ] **TV1:** API tìm kiếm + chi tiết sân, đánh giá; trang chi tiết sân, bản đồ, đăng ký; bỏ route ghép kèo; điều chỉnh xem trước lịch trống theo Q09
- [ ] **Nên có, nếu kịp:** ưu đãi và thông báo (TV1), danh sách đen (TV4), báo cáo/khiếu nại (TV5), sao kê và nộp phí tháng (TV4)

---

## 4. Kế hoạch theo tuần

### Tuần 1 (28/9 – 4/10): Phân tích, thiết kế, đặc tả API

- [ ] **Cả nhóm:** chốt danh sách chức năng, vẽ use case, thống nhất quy trình Git và quy ước API (mục 6)
- [ ] **Cả nhóm:** mỗi người viết đặc tả OpenAPI cho các API thuộc module của mình; TV5 gộp và tổ chức buổi duyệt
- [ ] **TV1:** wireframe màn hình người chơi trên Figma, chọn màu và font; khởi tạo dự án React + Vite + TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, Axios client có interceptor gắn JWT _(khung dự án đã khởi tạo trong `frontend/`, gồm cả MSW và design tokens; màu và font đã chốt, xem `docs/tv1/2026-10-31-thiet-ke-lai-trang-chu.md`; còn wireframe Figma)_
- [ ] **TV2:** thiết kế ERD (User, Venue, Court, PriceRule, Booking, Payment, Refund, Review, Notification); viết script Flyway `V1__init.sql`; phân tích bài toán tranh chấp khung giờ và chọn cơ chế khóa _(ERD logic 35 bảng đã có: `DatSan-ERD-v1.1-Chu-thich.md`, chọn exclusion constraint PostgreSQL; chưa có migration — `V1` đã dùng cho auth/user, migration booking đánh số tiếp)_
- [ ] **TV3:** đăng ký SePay sandbox ~~và VNPay sandbox~~ ngay (phải chờ kích hoạt); tìm hiểu định dạng VietQR; vẽ sequence diagram luồng thanh toán
- [ ] **TV4:** wireframe màn hình chủ sân và admin; đặc tả quy tắc tính giá (giờ cao điểm, cuối tuần, ngày lễ)
- [ ] **TV5:** khởi tạo Spring Boot (Java 21, Maven), cấu trúc package theo module, `docker-compose.yml` (PostgreSQL, backend, frontend), `GlobalExceptionHandler` với định dạng lỗi chuẩn, cấu hình springdoc, tạo bảng GitHub Projects _(đã xong: Spring Boot, package `common`/`auth`/`user`, `GlobalExceptionHandler`; Compose mới có PostgreSQL; chưa có springdoc)_

> 🏁 **Mốc 0 (4/10):** đặc tả API được duyệt, `docker compose up` chạy được cả hệ thống rỗng.

### Tuần 2 (5/10 – 11/10): Nền tảng

- [ ] **TV1:** layout chung, header/footer, trang chủ, bộ component dùng chung; dựng dữ liệu giả bằng MSW theo đặc tả OpenAPI để frontend không phải chờ backend
- [ ] **TV2:** entity và repository cho Court, Booking; dữ liệu mẫu (khoảng 10 cụm sân); API `GET /api/v1/courts/{id}/availability?date=` trả khung giờ trống
- [ ] **TV3:** service sinh mã VietQR theo đơn; endpoint `POST /api/v1/payments/sepay/webhook` dạng khung, chạy thử qua ngrok, lưu dữ liệu webhook thô vào bảng log
- [ ] **TV4:** API CRUD cụm sân và sân con (chỉ vai trò OWNER), upload ảnh; màn hình quản lý sân
- [ ] **TV5:** đăng ký/đăng nhập bằng JWT (access + refresh token), đăng nhập Google OAuth2, phân quyền PLAYER/OWNER/ADMIN bằng `@PreAuthorize`; màn hình đăng nhập/đăng ký; GitHub Actions chạy build và test cho cả backend lẫn frontend _(backend auth đã xong trên nhánh `tv5-exception/backend`, chưa merge; vai trò đổi thành `MEMBER/OWNER/ADMIN` theo v3; màn hình đăng nhập đã có, đăng ký chưa; chưa có GitHub Actions)_

### Tuần 3 (12/10 – 18/10): Chức năng lõi, phần 1

- [ ] **TV1:** API tìm kiếm có lọc (môn, khu vực, giá, giờ trống) bằng JPA Specification và phân trang; giao diện tìm kiếm và bản đồ Leaflet
- [ ] **TV2:** API `POST /api/v1/bookings` tạo đơn trạng thái HOLD giữ chỗ 5 phút; chống trùng bằng `@Transactional` + ràng buộc unique (court, ngày, khung giờ) + khóa lạc quan `@Version`; viết test tranh chấp bằng JUnit và `ExecutorService` _(v3: sau 5 phút còn 90 giây PAYMENT_GRACE; chống trùng theo khoảng giờ bằng exclusion constraint, ERD mục 4.1)_
- [ ] **TV3:** xử lý webhook SePay: xác thực chữ ký, tách mã đơn từ nội dung chuyển khoản, kiểm tra số tiền, chống ghi nhận trùng theo mã giao dịch, cập nhật Payment và Booking
- [ ] **TV4:** entity PriceRule và `PricingService` tính giá cho một lượt đặt (TV2 gọi); giao diện cấu hình bảng giá
- [ ] **TV5:** trang hồ sơ người dùng (backend + frontend); deploy staging tự động từ nhánh `dev`

### Tuần 4 (19/10 – 25/10): Chức năng lõi, phần 2 + ghép luồng

- [ ] **TV1:** trang chi tiết sân; ghép component chọn khung giờ của TV2 vào trang
- [ ] **TV2:** WebSocket STOMP phát sự kiện khi khung giờ đổi trạng thái (topic `/topic/courts/{id}/{date}`); `@Scheduled` tự hủy đơn HOLD quá hạn; frontend subscribe để lịch tự cập nhật
- [ ] **TV3:** màn hình thanh toán QR có đếm ngược; nhận sự kiện "đã thanh toán" qua WebSocket (dùng hạ tầng của TV2) để tự chuyển trang
- [ ] **TV4:** API và giao diện lịch đặt dạng tuần cho chủ sân; xác nhận/hủy đơn thủ công _(v3: duyệt/từ chối đơn PAID, đặt hộ Guest, chốt COMPLETED/NO_SHOW — lõi chuyển trạng thái do TV2)_
- [ ] **TV5:** điều phối ghép nối, review PR; viết test tích hợp luồng đặt – thanh toán bằng Testcontainers + MockMvc

> 🏁 **Mốc 1 (25/10):** demo trọn luồng tìm sân → chọn giờ → quét QR trả tiền thật → đơn "đã thanh toán" trên staging.

### Tuần 5 (26/10 – 1/11): Mở rộng

- [ ] **TV1:** API và giao diện đánh giá sân (chỉ người có đơn đã hoàn thành mới được đánh giá), tính điểm trung bình
- [ ] **TV2:** hủy đơn theo chính sách (chỉ hủy trước 24 giờ); trang lịch sử đặt của người chơi. _(v3: Member hủy trước ≥ 12 giờ)_ ~~Đổi lịch~~ _(ngoài phạm vi từ 14/11, xem mục 11 `use-case-api.md`)_
- [ ] **TV3:** lưu yêu cầu hoàn khi hủy đơn PAID, API danh sách chờ hoàn cho admin. _(v3: chủ sân hoàn và xác nhận, Member xác nhận đã nhận; Admin chỉ xử lý khoản quá hạn 12h/24h)_ ~~Tích hợp VNPay sandbox~~ _(ngoài phạm vi từ 14/11, xem mục 11 `use-case-api.md`)_
- [ ] **TV4:** API thống kê doanh thu, tỷ lệ lấp đầy theo khung giờ (truy vấn tổng hợp); dashboard biểu đồ bằng Recharts
- [ ] ~~**TV5:** ghép kèo (backend + frontend): tạo kèo gắn với một đơn đặt, người khác xin tham gia, chủ kèo duyệt~~ _(ngoài phạm vi từ 14/11, xem mục 11 `use-case-api.md`)_

### Tuần 6 (2/11 – 8/11): Hoàn thiện tính năng

- [ ] **TV1:** PWA bằng vite-plugin-pwa (cài được lên điện thoại), tối ưu giao diện mobile
- [ ] **TV2:** kiểm thử tải bằng k6: 100 request đồng thời vào cùng một khung giờ, chứng minh chỉ đúng 1 đơn thành công; bật virtual threads (`spring.threads.virtual.enabled=true`) và so sánh thông lượng trước/sau
- [ ] **TV3:** email nhắc lịch bằng Spring Mail (`@Scheduled` quét đơn sắp diễn ra); thông báo trong app khi đơn đổi trạng thái
- [ ] **TV4:** trang admin: duyệt chủ sân mới, khóa tài khoản, danh sách hoàn tiền. ~~Xử lý khiếu nại~~ _(ngoài phạm vi từ 14/11, xem mục 11 `use-case-api.md`)_
- [ ] **TV5:** ~~realtime cho ghép kèo~~ _(ngoài phạm vi từ 14/11, xem mục 11 `use-case-api.md`)_; giới hạn tần suất request bằng Bucket4j; rà soát Bean Validation và cấu hình CORS

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

> **Hiện trạng repo (19/11):** backend đã nằm trong `backend/` (package `vn.datsan.backend`), frontend trong `frontend/`. Hiện mới có module `common`, `auth`, `user`; danh sách module đầy đủ theo baseline v3 ở mục 10 của `use-case-api.md` (thêm `offer`, `report`).

```
dat-san/
├── backend/                  # Spring Boot (hiện đang ở gốc repo, xem ghi chú trên)
│   └── src/main/java/vn/datsan/backend/
│       ├── common/           # TV5: cấu hình, xử lý lỗi, tiện ích
│       ├── auth/             # TV5: đăng nhập, JWT, OAuth2
│       ├── user/             # TV5
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
| 6 | Thanh toán QR, webhook, hoàn tiền, thông báo | TV3 |
| 7 | Quản lý chủ sân, bảng giá, dashboard, admin | TV4 |
| 8 | Kiểm thử, đánh giá, hướng phát triển | Cả nhóm |

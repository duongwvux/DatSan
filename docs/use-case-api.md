# Use case và quy ước API

**Dự án:** Website đặt sân thể thao — nhóm 5 thành viên  
**Ngày:** 20/11/2026  
**Tài liệu nghiệp vụ gốc:** `Business-Rules-Catalog-DatSan-v3.md` (BRC), `Role-Permission-Matrix-DatSan-v3.md`, `Booking-State-Machine-DatSan-v3.md`, `Use-Case-Specification-DatSan-v3.md`, `mo-ta-du-an.md`.  
**Thiết kế dữ liệu:** `DatSan-ERD-v1.1-Chu-thich.md`.  
**Trạng thái:** Đề xuất, chờ nhóm duyệt.

Tài liệu này xác định phạm vi triển khai, các quyết định kỹ thuật và hợp đồng API của dự án. Quy tắc nghiệp vụ lấy theo bộ tài liệu v3; tài liệu này không đặt thêm quy tắc nghiệp vụ, chỉ phân công, chia mức ưu tiên và ghi các lựa chọn kỹ thuật (mã `Qxx`) cho những điểm nguồn còn để ngỏ.

## 1. Phạm vi và phân công

Hệ thống gồm 21 use case (`UC-01`…`UC-21`) và 11 đặc tả chi tiết cho đặt sân – thanh toán (`B-01`…`B-11`) theo `Use-Case-Specification-DatSan-v3.md`. Các use case được gom thành 7 nhóm để phân công.

| Nhóm | Use case | Mức | Phụ trách |
|---|---|---|---|
| G1. Tài khoản và quyền chủ sân | UC-02 Đăng ký tài khoản; UC-03 Quản lý tài khoản; UC-04 Nộp hồ sơ Owner | Bắt buộc | TV5 |
| | UC-17 Duyệt hồ sơ Owner; UC-18 Quản lý tài khoản người dùng | Bắt buộc | TV4 |
| G2. Tra cứu sân | UC-01 Tra cứu sân và thông tin | Bắt buộc | TV1 |
| G3. Đặt sân và thanh toán | UC-05 Đặt sân trực tuyến (B-01); UC-06 Thanh toán 100% qua chuyển khoản (B-02, B-11) | Bắt buộc | TV2 (đặt sân) / TV3 (thanh toán) |
| G4. Xử lý đơn và hoàn tiền | UC-07 Quản lý đơn cá nhân (B-03, B-04); UC-12 Quản lý đơn tại sân (B-05, B-06, B-08, B-09); UC-13 Đặt sân hộ Guest (B-07) | Bắt buộc | TV2 (chuyển trạng thái) / TV3 (hoàn tiền) / TV4 (giao diện chủ sân) |
| | UC-20 Xử lý hoàn tiền quá hạn (B-10) | Bắt buộc | TV3 (API) / TV4 (giao diện quản trị) |
| G5. Quản lý sân và doanh thu | UC-10 Quản lý địa điểm và sân con; UC-11 Quản lý lịch sân và giá; UC-16 Theo dõi doanh thu và hoa hồng | Bắt buộc (sao kê và nộp phí tháng của UC-16 là nên có) | TV4 |
| G6. Đánh giá | UC-08 Đánh giá sân | Bắt buộc | TV1 |
| G7. Nội dung và kiểm soát | UC-14 Quản lý ưu đãi và thông báo; UC-19 Duyệt ưu đãi và thông báo | Nên có | TV1 |
| | UC-15 Quản lý danh sách đen | Nên có | TV4 |
| | UC-09 Gửi báo cáo / khiếu nại; UC-20 phần xử lý báo cáo | Nên có | TV5 (API) / TV4 (giao diện quản trị) |
| | UC-21 Cấu hình hệ thống | Chờ chốt — nguồn chưa có danh mục tham số được phép thay đổi | — |

- Tác vụ tự động (mục 3.4): TV2 phụ trách giữ chỗ, chờ đối soát và hạn duyệt; TV3 phụ trách hoàn tiền quá hạn và các thông báo nhắc.
- Yêu cầu chung: bảo mật, giới hạn tần suất, kiểm tra đầu vào, hiệu năng, toàn vẹn lịch, cập nhật lịch theo thời gian thực, giao diện responsive/PWA (TV1 phụ trách PWA).
- TV5 phụ trách thêm khung backend, CI/CD, Docker, triển khai, điều phối nhóm và kiểm thử E2E.
- Thứ tự cắt giảm nếu thiếu thời gian: báo cáo/khiếu nại → ưu đãi và thông báo → danh sách đen → sao kê và nộp phí tháng. Khi bỏ ưu đãi, việc tạo đơn không nhận mã giảm giá; khi bỏ danh sách đen, việc tạo đơn không kiểm tra danh sách đen.

## 2. Quyết định thiết kế

| Mã | Quyết định | Căn cứ |
|---|---|---|
| Q01 | Xác thực email bằng link, hết hạn 24 giờ, dùng một lần. Tài khoản chưa xác thực email không được tạo đơn | UC-02 chưa quy định cơ chế xác thực |
| Q02 | Một tài khoản có tập vai trò `MEMBER`, `OWNER`, `ADMIN`. Duyệt hồ sơ chủ sân thì cấp thêm `OWNER`, giữ `MEMBER`. Mỗi chủ sân quản lý tối đa 1 địa điểm. Không có API công khai để tự cấp `ADMIN` | BR-ACC-01, BR-ACC-02 |
| Q03 | Đăng ký thu: họ tên, giới tính, ngày sinh, địa chỉ liên hệ, email, số điện thoại, mật khẩu. Không thu CCCD khi đăng ký thành viên (CCCD chỉ có trong hồ sơ chủ sân). Email và số điện thoại là duy nhất; mã tài khoản `accountCode` do hệ thống sinh | `mo-ta-du-an.md` bỏ CCCD ở phần đăng ký thành viên; UC-02 còn nhắc CCCD nên cần nhóm xác nhận |
| Q04 | Chỉ giao dịch chuyển đủ 100% tổng hóa đơn sau ưu đãi, đúng mã đơn, khi đơn còn `HOLD` hoặc `PAYMENT_GRACE` mới chuyển `PAID`. Chuyển thiếu không chuyển trạng thái, không cộng dồn. Giao dịch sai lệch được lưu `REQUIRES_REVIEW` để tra cứu, không làm đổi trạng thái đơn | BR-PAY-05, BR-PAY-09 |
| Q05 | Dùng thời điểm backend nhận webhook hợp lệ để so với hạn `graceExpiresAt`; vẫn lưu thời điểm giao dịch phía cổng (`gatewayOccurredAt`) để đối chiếu | OPEN-09 |
| Q06 | Tiền chuyển thẳng vào tài khoản nhận tiền của địa điểm; chủ sân là người hoàn tiền. Mỗi lần hủy có nghĩa vụ hoàn tạo một bản ghi hoàn tiền có hạn `dueAt` (24 giờ nếu thành viên hủy; 12 giờ nếu chủ sân từ chối/hủy hoặc quá hạn duyệt). Quá hạn thì chuyển quản trị viên xử lý trong 48 giờ | BR-PAY-07, BR-REF-01…03, BR-APR-06 |
| Q07 | Khi thành viên đã đủ 2 đơn `CONFIRMED` trong cùng ngày tạo, API duyệt trả 409 `CONFIRMED_QUOTA_EXCEEDED`. Chủ sân có thể từ chối đơn, hoặc để đơn tự hủy khi tới hạn duyệt. Không tự hoàn tiền chỉ vì hết hạn mức | BR-BKG-05; nguồn chưa có quy trình ngoại lệ |
| Q08 | Sau `endAt`, hệ thống nhắc chủ sân chốt kết quả một lần; quá `endAt + 24h` thì đơn được đánh dấu `resultOverdue`. Không chuyển quản trị viên, không tự đổi trạng thái, quản trị viên không chốt thay | BR-END-09, OPEN-05 |
| Q09 | Lịch trống chi tiết và kênh cập nhật lịch thời gian thực chỉ dành cho người đã đăng nhập. Trang công khai hiển thị thông tin sân, giá và giờ mở cửa | BR-ACC-04 |
| Q10 | Thứ tự ưu tiên giá: giá ngày lễ > giá theo thứ trong tuần > giá mặc định. Trong cùng mức ưu tiên không cho tạo khoảng giá chồng lấn | Cần quy tắc tính giá xác định |
| Q11 | Một đơn không kéo dài qua ngày hôm sau | Đơn giản hóa tính giá và lịch |
| Q12 | Đánh giá: mỗi đơn `COMPLETED` một đánh giá, được sửa trong 7 × 24 giờ kể từ lúc tạo, số sao nguyên 1–5 | UC-08 chưa quy định số lần sửa |
| Q13 | Mã giảm giá gắn vào đơn khi tạo `HOLD`. Đơn bị `CANCELLED` không được trả lại lượt dùng mã; đơn `EXPIRED` (chưa trả tiền) được trả lại lượt | BR-BKG-07; ERD chưa chốt trường hợp hết hạn |
| Q14 | Chủ sân hủy đơn đặt hộ Guest đã thu tiền: request bắt buộc có số tiền đã hoàn (bằng số đã thu) và thời điểm hoàn; tệp chứng từ tùy chọn. Thiếu dữ liệu thì không cho chuyển `REFUNDED` | Booking State Machine, ràng buộc của T23 |
| Q15 | Thành viên được nộp hồ sơ chủ sân mới khi không còn hồ sơ nào đang chờ duyệt | UC-04 chưa quy định nộp lại |
| Q16 | Môi trường demo dùng một tài khoản SePay; các địa điểm demo khai báo tài khoản nhận tiền trỏ về tài khoản đó. API vẫn gắn tài khoản nhận tiền theo từng địa điểm | Webhook SePay gắn với tài khoản ngân hàng đã liên kết |
| Q17 | Frontend và backend dùng chung origin qua reverse proxy: `/` → frontend; `/api`, `/oauth2`, `/login/oauth2`, `/ws` → backend. Khi phát triển dùng proxy của Vite | Cookie refresh dùng được với `SameSite`, không cần CORS kèm credentials |
| Q18 | Sau đăng nhập Google, backend đặt cookie refresh rồi chuyển hướng về `/oauth2/callback`; frontend gọi `POST /auth/refresh` để lấy access token | Không đưa token lên URL |
| Q19 | Kết nối thời gian thực dùng STOMP trên WebSocket thuần tại `/ws`; access token gửi trong header của frame CONNECT | Trình duyệt không gắn được header vào handshake WebSocket |
| Q20 | `GET /users/me` trả `id, accountCode, fullName, email, emailVerified, phone, avatarUrl, roles` | Frontend cần ngay khi tải trang |
| Q21 | `GET /venues` hỗ trợ lọc `sportId`, `district`, `minPrice`, `maxPrice`, `minRating`, `featured`; sắp xếp theo `ratingAverage`, `minPricePerHour`, `distance` (khi có `lat`, `lng`) | UC-01 |

## 3. Quy tắc nghiệp vụ và trạng thái

### 3.1. Quy tắc chung

- Múi giờ nghiệp vụ là `Asia/Ho_Chi_Minh`; thời gian server là chuẩn. "Ngày tạo" của đơn tính theo ngày địa phương của `createdAt`.
- Có hai loại đơn: `MEMBER_BOOKING` (thành viên tự đặt, kể cả chủ sân đặt sân khác với tư cách thành viên) và `OWNER_GUEST_BOOKING` (chủ sân đặt hộ khách vãng lai tại địa điểm của mình).
- Đơn vị đặt 30 phút; mỗi đơn từ 60 đến 240 phút, trên đúng một sân con, nằm trong giờ mở cửa và không trùng khoảng chặn lịch. Không giới hạn tổng thời lượng các đơn liên tiếp.
- Khoảng thời gian có dạng `[startAt, endAt)`.
- Đơn phải được tạo trước giờ chơi từ 3 giờ đến 30 ngày, tính cả hai biên; áp dụng cho cả hai loại đơn.
- Giữ chỗ (`HOLD`) 5 phút kể từ lúc tạo; sau đó thêm 90 giây chờ đối soát (`PAYMENT_GRACE`). Trong thời gian chờ đối soát không phát mã QR mới.
- Khi `now >= holdExpiresAt` hoặc `now >= graceExpiresAt` thì coi như đã quá mốc, kể cả khi tác vụ nền chưa chạy.
- Giá do backend tính theo từng đoạn 30 phút, áp tối đa một mã giảm giá đã được quản trị viên duyệt. Hóa đơn lưu giá tại thời điểm tạo đơn, không đổi khi bảng giá thay đổi.
- Thành viên trong danh sách đen của địa điểm không tự đặt được sân tại địa điểm đó.
- Mỗi thành viên có tối đa 2 đơn `MEMBER_BOOKING` ở trạng thái `CONFIRMED` trong cùng một ngày tạo; kiểm tra khi chủ sân duyệt. Đơn đặt hộ Guest không tính vào hạn mức.
- Hạn duyệt: `approvalDeadline = min(paidAt + 24h, startAt − 2h)`.
- Thành viên hủy đơn `PAID`/`CONFIRMED` khi `now ≤ startAt − 12h`. Chủ sân hủy đơn của thành viên không bị giới hạn mốc 12 giờ. Chủ sân chỉ hủy đơn đặt hộ Guest khi `now < startAt`.
- Chủ sân chốt kết quả trong khoảng `[endAt, endAt + 24h]`.
- Hoa hồng nền tảng bằng 30% số tiền chủ sân thực nhận của đơn `COMPLETED`/`NO_SHOW`, tổng hợp theo tháng; không suy ra từ tổng hóa đơn.
- Thành viên chỉ xem và hủy đơn của mình. Chủ sân chỉ thao tác địa điểm, sân con, đơn và danh sách đen của địa điểm mình. Quản trị viên chỉ có các quyền ở Role–Permission Matrix mục 3.4; không tạo, sửa đơn và không chốt kết quả thay chủ sân.

### 3.2. Trạng thái đơn và các bước chuyển

Trạng thái được lưu: `HOLD`, `PAYMENT_GRACE`, `PAID`, `CONFIRMED`, `EXPIRED`, `CANCELLED`, `REFUNDED`, `NO_SHOW`, `COMPLETED`. Bước `REGISTER` của sơ đồ trạng thái chỉ là bước điền form, không lưu vào cơ sở dữ liệu.

Các trạng thái `HOLD`, `PAYMENT_GRACE`, `PAID`, `CONFIRMED` chiếm lịch sân; `EXPIRED`, `CANCELLED`, `REFUNDED` không chiếm lịch.

| Mã | Từ → Sang | Người thực hiện | API hoặc tác vụ | Kết quả |
|---|---|---|---|---|
| T02 | — → `HOLD` | Thành viên | POST `/bookings` | Tạo đơn và hóa đơn, chiếm lịch |
| T03 | — → `CONFIRMED` | Chủ sân | POST `/owner/guest-bookings` | Tạo đơn đặt hộ Guest, hóa đơn và thông tin Guest, chiếm lịch |
| T05, T08 | `HOLD`/`PAYMENT_GRACE` → `PAID` | Cổng thanh toán | POST `/payments/sepay/webhook` | Lưu giao dịch, ghi `paidAt`, `approvalDeadline`; báo chủ sân |
| T06 | `HOLD` → `PAYMENT_GRACE` | Hệ thống | Tác vụ A1 | Ẩn mã QR |
| T09 | `PAYMENT_GRACE` → `EXPIRED` | Hệ thống | Tác vụ A2 | Nhả lịch; trả lại lượt mã giảm giá (Q13) |
| T07, T10 | `HOLD`/`PAYMENT_GRACE` → `CANCELLED` | Thành viên | POST `/bookings/{id}/cancellations` | Nhả lịch, không phát sinh hoàn tiền |
| T13, T15 | `PAID`/`CONFIRMED` → `CANCELLED` | Thành viên | POST `/bookings/{id}/cancellations` | Nhả lịch, hoàn 100%, hạn 24 giờ |
| T11 | `PAID` → `CONFIRMED` | Chủ sân | POST `/owner/bookings/{id}/approvals` | Kiểm tra hạn duyệt và hạn mức |
| T12 | `PAID` → `CANCELLED` | Chủ sân | POST `/owner/bookings/{id}/rejections` | Nhả lịch, hoàn 100%, hạn 12 giờ |
| T14 | `PAID` → `CANCELLED` | Hệ thống | Tác vụ A3 | Nhả lịch, hoàn 100%, hạn 12 giờ |
| T16 | `CONFIRMED` → `CANCELLED` (đơn thành viên) | Chủ sân | POST `/owner/bookings/{id}/cancellations` | Nhả lịch, giảm hạn mức, hoàn 100%, hạn 12 giờ |
| T24 | `CONFIRMED` → `CANCELLED` (đặt hộ Guest, chưa thu tiền) | Chủ sân | POST `/owner/bookings/{id}/cancellations` | Nhả lịch, không hoàn tiền |
| T23 | `CONFIRMED` → `REFUNDED` (đặt hộ Guest, đã thu tiền) | Chủ sân | POST `/owner/bookings/{id}/cancellations` kèm dữ liệu hoàn (Q14) | Nhả lịch ngay, lưu khoản đã hoàn |
| T17, T18 | `CONFIRMED` → `NO_SHOW`/`COMPLETED` (đơn thành viên) | Chủ sân | POST `/owner/bookings/{id}/results` | Khách đến → `COMPLETED`; vắng → `NO_SHOW` |
| T19 | `CONFIRMED` → `COMPLETED` (đặt hộ Guest) | Chủ sân | POST `/owner/bookings/{id}/results` | Luôn `COMPLETED`, ghi số tiền thực nhận |
| T20 | `CANCELLED` → `REFUNDED` | Chủ sân xác nhận đã hoàn và thành viên xác nhận đã nhận | POST `/owner/refunds/{id}/completions`; POST `/refunds/{id}/member-confirmations` | Hoàn tất hoàn tiền, không nhả lịch lần hai |

Mã T theo `Booking-State-Machine-DatSan-v3.md`. Không có API sửa trạng thái tùy ý. Mỗi lần chuyển trạng thái, việc cập nhật `bookings.status`, ghi `booking_status_events` và chiếm/nhả lịch nằm trong cùng một transaction. Mỗi đơn chỉ nhả lịch một lần. Email và sự kiện thời gian thực được gửi sau khi commit.

### 3.3. Thanh toán, tiền thực nhận và hoàn tiền

Các dữ liệu này được lưu riêng, không gộp vào trạng thái đơn.

- **Yêu cầu thanh toán (`PaymentRequest`):** chỉ có ở đơn thành viên; mỗi đơn một yêu cầu, số tiền bằng tổng hóa đơn, gắn tài khoản nhận tiền của địa điểm.
- **Giao dịch (`PaymentTransaction`):** trạng thái `SUCCEEDED` hoặc `REQUIRES_REVIEW` kèm lý do `UNDERPAID`, `OVERPAID`, `LATE_PAYMENT`, `DUPLICATE_PAYMENT`, `UNMATCHED_BOOKING`. Mỗi giao dịch là duy nhất theo cặp (nhà cung cấp, mã giao dịch).
- **Tiền thực nhận (`OwnerReceipt`):** đơn thành viên sinh tự động từ giao dịch thành công; đơn đặt hộ Guest do chủ sân khai báo. Là cơ sở tính hoa hồng.
- **Hoàn tiền (`Refund`):** với đơn thành viên đi qua `PENDING` → `OWNER_CONFIRMED` → `COMPLETED`, cần cả xác nhận của chủ sân và thành viên; quá `dueAt` thì ghi `escalatedAt`. Với đơn đặt hộ Guest đã thu tiền, bản ghi hoàn tiền được tạo thẳng ở `COMPLETED` cùng lúc đơn chuyển `REFUNDED`. Đơn không có khoản hoàn thì trả `refund: null`.

### 3.4. Tác vụ tự động

| Mã | Điều kiện | Hành động | Chu kỳ | Phụ trách |
|---|---|---|---|---|
| A1 | Đơn `HOLD` và `now ≥ holdExpiresAt` | Chuyển `PAYMENT_GRACE` | 15 giây | TV2 |
| A2 | Đơn `PAYMENT_GRACE` và `now ≥ graceExpiresAt` | Chuyển `EXPIRED`, nhả lịch | 15 giây | TV2 |
| A3 | Đơn `PAID` và `now ≥ approvalDeadline` | Chuyển `CANCELLED`, tạo hoàn tiền hạn 12 giờ | 1 phút | TV2 |
| A4 | Hoàn tiền chưa `COMPLETED` và `now ≥ dueAt` | Ghi `escalatedAt`, báo quản trị viên; hạn xử lý `escalatedAt + 48h` | 5 phút | TV3 |
| A5 | Đơn `CONFIRMED`, `now ≥ endAt`, chưa chốt | Nhắc chủ sân một lần; quá `endAt + 24h` thì đánh dấu `resultOverdue` (Q08) | 15 phút | TV3 |
| A6 | Đơn `CONFIRMED` sắp tới giờ chơi | Email nhắc lịch trước 2 giờ, gửi một lần | 5 phút | TV3 |

Tác vụ chỉ cập nhật khi trạng thái hiện tại còn đúng điều kiện, nên chạy lặp vẫn an toàn; nếu tranh chấp với webhook hoặc thao tác người dùng thì chỉ một bên thành công.

## 4. Luồng xử lý chính

Luồng đầy đủ (luồng chính, luồng thay thế, ngoại lệ) xem `Use-Case-Specification-DatSan-v3.md`. Phần dưới đây mô tả những điểm backend phải đảm bảo.

### 4.1. Tài khoản và quyền chủ sân (UC-02, UC-03, UC-04, UC-17, UC-18)

- **Đăng ký và quản lý tài khoản:** trường theo Q03; đăng nhập bằng mật khẩu hoặc Google; quên và đổi mật khẩu; không sửa vai trò, trạng thái qua API hồ sơ.
- **Hồ sơ chủ sân:** thành viên nộp hồ sơ (thông tin cá nhân và CCCD, hộ kinh doanh, địa điểm dự kiến, tài khoản nhận tiền, giấy tờ), hồ sơ ở trạng thái `PENDING`. Quản trị viên xem giấy tờ (tệp riêng tư) rồi duyệt hoặc từ chối:
  - **Duyệt (`APPROVED`):** trong cùng transaction, cấp thêm vai trò `OWNER`, tạo địa điểm và tài khoản nhận tiền từ dữ liệu hồ sơ.
  - **Từ chối (`REJECTED`):** bắt buộc ghi lý do.
- **Khóa/mở tài khoản:** quản trị viên khóa có ghi lý do; tài khoản bị khóa mất toàn bộ phiên đăng nhập. Việc khóa không tự hủy đơn hay hoàn tiền đang có.

### 4.2. Tạo đơn của thành viên (UC-05, B-01)

1. Thành viên chọn sân con, khung giờ và mã giảm giá (nếu có); frontend gọi `POST /booking-quotes` để hiển thị hóa đơn tạm tính.
2. Thành viên xác nhận; frontend gọi `POST /bookings` kèm `Idempotency-Key`.
3. Backend kiểm tra: tài khoản đang hoạt động, email đã xác thực, cửa sổ đặt 3 giờ–30 ngày, thời lượng 1–4 giờ, giờ mở cửa, sân con không bị ẩn, không trùng khoảng chặn, danh sách đen, mã giảm giá.
4. Trong một transaction: chiếm lịch (ràng buộc chống chồng khoảng thời gian, ERD mục 4.1), tạo đơn, hóa đơn và bản ghi lịch sử trạng thái.
5. Trả 201; nếu lịch đã bị chiếm thì trả 409 `BOOKING_SLOT_TAKEN`.

Hạn mức 2 đơn `CONFIRMED` không kiểm tra ở bước này; báo giá có thể kèm cảnh báo `quotaWarning` nhưng không chặn.

### 4.3. Thanh toán (UC-06, B-02, B-11)

1. Khi đơn ở `HOLD`, thành viên gọi `POST /bookings/{id}/payment-requests`; gọi lại sẽ nhận đúng yêu cầu cũ. Khi đơn ở `PAYMENT_GRACE` thì trả 409 `PAYMENT_GRACE_NO_NEW_REQUEST`.
2. Mã VietQR chứa số tiền bằng tổng hóa đơn, nội dung chuyển khoản là `bookingCode`, tài khoản nhận là tài khoản của địa điểm (Q16).
3. Khi nhận webhook: xác thực theo tài liệu SePay → lưu giao dịch → khóa đơn → nếu đúng mã đơn, đủ tiền và còn hạn (Q05) thì ghi giao dịch thành công, tiền thực nhận, chuyển `PAID` và tính `approvalDeadline` trong cùng transaction.
4. Sau khi commit: gửi sự kiện cho thành viên, thông báo chủ sân có đơn chờ duyệt.
5. Giao dịch sai lệch được lưu `REQUIRES_REVIEW`. Webhook gửi lặp không gây tác dụng phụ.

### 4.4. Chủ sân xử lý đơn (UC-12, UC-13, B-05…B-08)

- **Duyệt:** khóa theo (thành viên, ngày tạo); kiểm tra đơn thuộc địa điểm, còn `PAID`, chưa quá hạn duyệt và số đơn `CONFIRMED` nhỏ hơn 2. Lỗi: 409 `APPROVAL_DEADLINE_PASSED`, `CONFIRMED_QUOTA_EXCEEDED` (Q07).
- **Từ chối hoặc hủy đơn thành viên:** bắt buộc nhập lý do; tạo khoản hoàn 100% hạn 12 giờ.
- **Đặt hộ Guest:** bắt buộc họ tên, ngày sinh, số điện thoại của Guest cùng thông tin đặt sân như đơn thường; tạo thẳng `CONFIRMED` kèm hóa đơn, không qua thanh toán, không tính hạn mức; số tiền thực nhận mặc định 0 và chủ sân cập nhật sau.
- **Hủy đơn đặt hộ Guest:** chỉ khi `now < startAt`, nếu không trả 409 `GUEST_BOOKING_ALREADY_STARTED`. Đã thu tiền → `REFUNDED` kèm dữ liệu hoàn (Q14); chưa thu → `CANCELLED`.
- **Chốt kết quả:** gửi `attendance = ATTENDED | ABSENT`; ngoài khoảng `[endAt, endAt + 24h]` trả 409 `RESULT_WINDOW_CLOSED`. Đơn đặt hộ Guest luôn ra `COMPLETED` và kèm số tiền thực nhận.

### 4.5. Hủy đơn và hoàn tiền (UC-07, UC-20, B-03, B-04, B-09, B-10)

1. Thành viên hủy theo bảng mục 3.2; quá mốc 12 giờ thì trả 409 `BOOKING_CANCELLATION_WINDOW_CLOSED`.
2. Chủ sân chuyển tiền cho thành viên ngoài hệ thống, sau đó xác nhận trên hệ thống với số tiền đã hoàn (phải bằng số tiền cần hoàn), thời điểm, mã tham chiếu chuyển khoản và chứng từ (tùy chọn).
3. Thành viên xác nhận đã nhận tiền. Khi đủ hai xác nhận, khoản hoàn chuyển `COMPLETED` và đơn chuyển `REFUNDED`.
4. Quá `dueAt` mà chưa hoàn tất: tác vụ A4 ghi `escalatedAt`. Quản trị viên xem danh sách khoản hoàn quá hạn và ghi kết quả xử lý. Quản trị viên không xác nhận thay chủ sân hay thành viên, nên kết quả xử lý không tự chuyển đơn sang `REFUNDED`.

### 4.6. Doanh thu và hoa hồng (UC-16)

Chủ sân chọn kỳ báo cáo; hệ thống tổng hợp tổng hóa đơn, tiền thực nhận, tiền đã hoàn và hoa hồng phải nộp (30% tiền thực nhận của đơn `COMPLETED`/`NO_SHOW`). Đơn đặt hộ Guest chưa thu tiền có tiền thực nhận bằng 0 và hoa hồng bằng 0. Sao kê và ghi nhận nộp phí theo tháng là phần nên có.

### 4.7. Nội dung và kiểm soát (UC-09, UC-14, UC-15, UC-19, UC-20)

- **Ưu đãi và thông báo:** chủ sân tạo mã giảm giá (sân con áp dụng, thời gian, phần trăm giảm) hoặc thông báo/khuyến mãi ở trạng thái chờ duyệt. Chỉ nội dung được quản trị viên duyệt mới được áp dụng hoặc hiển thị; thông báo hiển thị tối đa 3 tháng.
- **Danh sách đen:** chủ sân thêm thành viên theo mã tài khoản kèm lý do, mã đơn và khoản nợ (nếu có); gỡ khỏi danh sách đen là gỡ mềm. Thêm vào danh sách đen không tự hủy đơn đang có.
- **Báo cáo/khiếu nại:** thành viên gửi tiêu đề, nội dung, đơn liên quan (nếu có) và tệp ảnh/PDF; quản trị viên xem và ghi kết quả xử lý. Báo cáo không tự thay đổi đơn hay hoàn tiền.

### 4.8. Cấu hình hệ thống (UC-21)

Nguồn chỉ mô tả khung: chưa có danh mục tham số, quyền thay đổi và cơ chế duyệt. Các hằng số nghiệp vụ (5 phút, 90 giây, 12/24 giờ, 30%) không được đưa thành tham số tùy ý thay đổi. Chưa thiết kế API cho tới khi nhóm chốt danh mục tham số.

## 5. Quy ước API chung

| Hạng mục | Quy ước |
|---|---|
| Base path | `/api/v1` |
| Đường dẫn | Danh từ số nhiều, chữ thường, từ ghép dùng kebab-case. Riêng `/owner/venue` dùng số ít vì mỗi chủ sân có một địa điểm |
| JSON | UTF-8, thuộc tính camelCase, enum UPPER_SNAKE_CASE |
| GET | Chỉ đọc |
| POST | Tạo mới hoặc thực hiện hành động nghiệp vụ (`/approvals`, `/rejections`, `/cancellations`, `/results`, `/decisions`) |
| PATCH | Cập nhật một phần; không dùng để gán trạng thái nghiệp vụ |
| DELETE | Chỉ cho tài nguyên được phép xóa; dữ liệu có lịch sử dùng ẩn hoặc gỡ mềm |
| ID | UUID dạng chuỗi. `bookingCode`, `accountCode` chỉ dùng để hiển thị và đối soát, không phải bằng chứng quyền truy cập |
| Thời gian | RFC 3339 có offset; response trả theo UTC (`Z`); ngày dạng `YYYY-MM-DD`; giờ mở cửa dạng `HH:mm` |
| Tiền | Số nguyên VND kèm `currency: "VND"`; backend không dùng float/double cho tiền |
| Phân trang | `page` từ 0, `size` mặc định 20, tối đa 100; giá trị ngoài giới hạn trả 400 |
| Sắp xếp | `sort=createdAt,desc`; chỉ nhận các trường trong danh sách cho phép của từng endpoint |
| Xác thực | Access token JWT qua header `Authorization: Bearer`. Refresh token nằm trong cookie HttpOnly, được xoay vòng khi refresh; endpoint dùng cookie kiểm tra Origin và CSRF |
| PATCH với null | Không gửi field: giữ nguyên; gửi null: xóa giá trị (chỉ với field cho phép); chuỗi rỗng khác null |
| Tài liệu API | Một file OpenAPI chung `docs/openapi.yaml`; mỗi API ghi quyền, DTO, ví dụ, lỗi và yêu cầu idempotency |

### 5.1. Response thành công

Response không bọc thêm `success`/`data`. POST tạo mới trả 201 kèm header `Location`; POST hành động trả 200 kèm tài nguyên sau khi thay đổi; GET và PATCH trả 200; thao tác không có nội dung trả 204. Yêu cầu quên mật khẩu trả 202 với cùng thông báo dù email có tồn tại hay không.

Danh sách luôn có dạng phân trang, kể cả khi rỗng:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

Lịch trống là tài nguyên tổng hợp theo ngày, không dùng dạng phân trang.

### 5.2. Idempotency và thời gian thực

- Bắt buộc header `Idempotency-Key` (UUID) cho: tạo đơn thành viên, tạo đơn đặt hộ Guest, chủ sân hủy đơn đặt hộ Guest có hoàn tiền, chủ sân xác nhận đã hoàn tiền. Khóa theo người dùng + route + key, lưu tối thiểu 24 giờ. Đang xử lý trả 409 `REQUEST_IN_PROGRESS`; cùng key nhưng khác nội dung trả 409 `IDEMPOTENCY_KEY_REUSED`.
- Các hành động chuyển trạng thái khác an toàn khi gửi lại nhờ kiểm tra trạng thái hiện tại; lần gửi thứ hai trả 409 `BOOKING_INVALID_STATE`.
- Webhook chống ghi trùng theo cặp (nhà cung cấp, mã giao dịch).
- Kênh thời gian thực:
  - Lịch sân: `/topic/courts/{courtId}/availability/{date}`, chỉ người đã đăng nhập được đăng ký (Q09); nội dung chỉ gồm khoảng giờ và `available`, không lộ người đặt hay thông tin Guest.
  - Đơn và thông báo của thành viên: `/user/queue/bookings`, `/user/queue/notifications`.
  - Đơn của chủ sân: `/user/queue/owner-bookings`.
- Sự kiện gửi sau khi commit, có `eventId` để loại trùng; khi kết nối lại, frontend tải lại dữ liệu.

## 6. Danh mục endpoint

Cột "Đã có" đánh dấu endpoint đã được triển khai trên nhánh `tv5-exception/backend`.

### 6.1. Bắt buộc

| Module | Method và path | Đã có | Quyền / mục đích |
|---|---|:---:|---|
| auth | POST `/auth/register`, `/auth/email-verifications`, `/auth/email-verification-requests` | ✅ | Đăng ký, xác thực email, gửi lại link (cần bổ sung trường theo Q03) |
| auth | POST `/auth/login`, `/auth/refresh`, `/auth/logout`; GET `/auth/csrf` | ✅ | Phiên đăng nhập |
| auth | POST `/auth/password-reset-requests`, `/auth/password-resets` | ✅ | Quên mật khẩu |
| auth | GET `/oauth2/authorization/google`; GET `/login/oauth2/code/google` | ✅ | Đăng nhập Google; nằm ngoài `/api/v1` |
| user | GET `/users/me`; POST `/users/me/password-changes` | ✅ | Thông tin phiên, đổi mật khẩu |
| user | PATCH `/users/me` | | Sửa hồ sơ; không sửa email, vai trò, trạng thái |
| upload | POST `/uploads` | | Người đã đăng nhập; ảnh JPEG/PNG/WebP, tài liệu PDF |
| owner application | POST `/owner-applications`; GET `/owner-applications/me` | | Thành viên chưa là chủ sân |
| search | GET `/venues`, `/venues/{id}`, `/venues/{id}/reviews`; GET `/sports` | | Công khai |
| booking | GET `/courts/{id}/availability?date=` | | Người đã đăng nhập (Q09) |
| booking | POST `/booking-quotes` | | Báo giá kèm mã giảm giá, không giữ chỗ |
| booking | POST `/bookings`; GET `/bookings?group=`; GET `/bookings/{id}` | | Thành viên; chỉ đơn của mình |
| booking | POST `/bookings/{id}/cancellations` | | Chủ đơn |
| payment | POST `/bookings/{id}/payment-requests`; GET `/bookings/{id}/payment-requests/current` | | Chủ đơn |
| payment | POST `/payments/sepay/webhook` | | Xác thực theo nhà cung cấp, không dùng JWT |
| refund | POST `/refunds/{id}/member-confirmations` | | Chủ đơn xác nhận đã nhận tiền |
| notification | GET `/notifications`; PATCH `/notifications/{id}` | | Người nhận; PATCH chỉ nhận `read: true` |
| review | POST `/bookings/{id}/reviews`; PATCH `/reviews/{id}` | | Chủ đơn hoặc tác giả (Q12) |
| owner venue | GET/PATCH `/owner/venue`; PUT `/owner/venue/payout-account` | | Chủ sân |
| owner court | GET/POST `/owner/venue/courts`; PATCH `/owner/courts/{id}`; PUT `/owner/courts/{id}/opening-hours` | | Chủ sân; `hidden: true` để ẩn sân con |
| owner price | GET/POST `/owner/courts/{id}/price-rules`; PATCH/DELETE `/owner/price-rules/{id}` | | Chủ sân; kiểm tra chồng lấn theo Q10 |
| owner block | GET/POST `/owner/courts/{id}/blocks`; DELETE `/owner/blocks/{id}` | | Chủ sân; không được chặn lên đơn đang chiếm lịch |
| owner booking | GET `/owner/bookings?status=&type=&from=&to=` | | Chủ sân; có cờ `resultOverdue` |
| owner booking | POST `/owner/guest-bookings` | | Chủ sân đặt hộ Guest |
| owner booking | POST `/owner/bookings/{id}/approvals`, `/owner/bookings/{id}/rejections`, `/owner/bookings/{id}/cancellations`, `/owner/bookings/{id}/results` | | Chủ sân (mục 4.4) |
| owner booking | PUT `/owner/bookings/{id}/receipt` | | Chủ sân khai báo tiền thực nhận của đơn đặt hộ Guest |
| owner refund | GET `/owner/refunds?status=`; POST `/owner/refunds/{id}/completions` | | Chủ sân xác nhận đã hoàn |
| stats | GET `/owner/statistics?from=&to=`; GET `/owner/commissions?month=YYYY-MM` | | Chủ sân; doanh thu, tiền thực nhận, hoa hồng |
| admin | GET `/admin/owner-applications?status=`, `/admin/owner-applications/{id}`; POST `/admin/owner-applications/{id}/decisions` | | Quản trị viên duyệt hồ sơ |
| admin | GET `/admin/users`; POST `/admin/users/{id}/locks`; DELETE `/admin/users/{id}/locks` | | Quản trị viên khóa/mở tài khoản, có lý do |
| admin refund | GET `/admin/refunds?escalated=true`; POST `/admin/refunds/{id}/resolutions` | | Quản trị viên xử lý hoàn tiền quá hạn |

Bộ lọc `group` trong lịch sử đơn của thành viên:

- `upcoming`: `HOLD`/`PAYMENT_GRACE` còn hạn, `PAID`, `CONFIRMED` chưa kết thúc.
- `played`: `COMPLETED`, `NO_SHOW`, và `CONFIRMED` đã qua giờ chơi đang chờ chốt.
- `cancelled`: `CANCELLED`, `REFUNDED`, `EXPIRED`.

### 6.2. Nên có

| Module | Method và path | Mục đích |
|---|---|---|
| offer | GET/POST `/owner/discount-codes`; PATCH `/owner/discount-codes/{id}` (chỉ khi chưa duyệt) | UC-14: mã giảm giá |
| offer | GET/POST `/owner/announcements` | UC-14: thông báo, khuyến mãi |
| offer | GET `/announcements?venueId=` | Công khai; trang nổi bật, chỉ nội dung đã duyệt và còn hạn |
| admin offer | GET `/admin/discount-codes?status=PENDING`, `/admin/announcements?status=PENDING`; POST `/admin/discount-codes/{id}/decisions`, `/admin/announcements/{id}/decisions` | UC-19 |
| blacklist | GET/POST `/owner/blacklist-entries`; DELETE `/owner/blacklist-entries/{id}` (gỡ mềm) | UC-15 |
| report | POST `/reports`; GET `/reports/me` | UC-09 |
| admin report | GET `/admin/reports?status=`; POST `/admin/reports/{id}/resolutions` | UC-20 phần báo cáo |
| stats | GET `/owner/commission-statements`; POST `/owner/commission-statements/{id}/remittances` | UC-16: sao kê và nộp phí tháng |

## 7. Quy ước DTO

- Tên request `<Action><Resource>Request`; tên response `<Resource>Response` hoặc `<Resource>SummaryResponse`. Không dùng Entity làm request hoặc response.
- DTO trả ra ngoài không chứa: hash mật khẩu/token, CCCD, số tài khoản ngân hàng đầy đủ (trừ trong yêu cầu thanh toán của chính đơn đó), giấy tờ, dữ liệu webhook thô.
- Request không nhận `userId`, `ownerId`, `memberId`, `roles`, `status`, `bookingType`, `totalAmount`; backend lấy danh tính từ phiên và tự tính toán.
- Request chứa field không khai báo trả 400 (trừ webhook).
- Kiểm tra kiểu, độ dài, khoảng giá trị ở DTO; kiểm tra quyền, trạng thái, chống trùng ở service và cơ sở dữ liệu.
- Giới hạn: họ tên 2–100 ký tự; mật khẩu 8–72 byte UTF-8; lý do hủy/từ chối tối đa 500 ký tự; nội dung đánh giá tối đa 2000; nội dung báo cáo tối đa 5000; email được trim và chuyển chữ thường; số điện thoại chuẩn hóa E.164.
- Tệp tải lên tối đa 5 MiB; kiểm tra nội dung thực của tệp; giấy tờ, chứng từ và bằng chứng báo cáo là tệp riêng tư, không có URL công khai.

### 7.1. Ví dụ tạo đơn

Request `POST /bookings`:

```json
{
  "courtId": "3a487c86-f5bf-4fc8-b276-2cf3ae3d7801",
  "startAt": "2026-12-01T18:00:00+07:00",
  "endAt": "2026-12-01T19:00:00+07:00",
  "discountCode": null,
  "note": ""
}
```

Response 201:

```json
{
  "id": "a3c8ab5a-f62e-4b61-b8f6-7489fd49e25f",
  "bookingCode": "DS7K9M2Q",
  "bookingType": "MEMBER_BOOKING",
  "courtId": "3a487c86-f5bf-4fc8-b276-2cf3ae3d7801",
  "status": "HOLD",
  "startAt": "2026-12-01T11:00:00Z",
  "endAt": "2026-12-01T12:00:00Z",
  "invoice": {
    "subtotalAmount": 120000,
    "discountAmount": 0,
    "totalAmount": 120000,
    "currency": "VND",
    "discountCode": null
  },
  "createdAt": "2026-11-28T16:10:00Z",
  "holdExpiresAt": "2026-11-28T16:15:00Z",
  "graceExpiresAt": "2026-11-28T16:16:30Z",
  "paidAt": null,
  "approvalDeadline": null,
  "confirmedAt": null,
  "cancelledAt": null,
  "cancelReason": null,
  "refund": null
}
```

### 7.2. Các DTO chính

| DTO | Trường chính |
|---|---|
| RegisterRequest | fullName, gender, dateOfBirth, contactAddress, email, phone, password |
| LoginRequest | email, password |
| TokenResponse | accessToken, tokenType = `Bearer`, expiresIn = 900 |
| ResetPasswordRequest | token, newPassword |
| UpdateProfileRequest | fullName, gender, dateOfBirth, contactAddress, phone, avatarUploadId |
| OwnerApplicationRequest | Cá nhân: dateOfBirth, nationalId, nationalIdIssueDate, permanentAddress, phone. Kinh doanh: businessName, registeredAddress, businessSector, businessCapital, employeeCount, establishmentSubject. Địa điểm: proposedVenueName, proposedVenueAddress, sportIds, proposedAreaM2, proposedCourtCount, openingHours, facilityDescription. Nhận tiền: bankName, bankAccountNumber, bankAccountHolder. Giấy tờ: documents[{type, uploadId}] |
| OwnerApplicationDecisionRequest | decision = `APPROVED`/`REJECTED`; reason bắt buộc khi từ chối |
| LockUserRequest | reason |
| CreateBookingRequest, BookingQuoteRequest | courtId, startAt, endAt, discountCode, note |
| CreateGuestBookingRequest | courtId, startAt, endAt, discountCode, guest {fullName, dateOfBirth, phone} (bắt buộc cả ba), actualReceived (mặc định 0), note |
| CancelBookingRequest | reason (bắt buộc khi chủ sân hủy) |
| OwnerCancelBookingRequest | reason; với đơn đặt hộ Guest đã thu tiền thêm refund {refundedAmount, refundedAt, proofFileId} (Q14) |
| BookingResultRequest | attendance = `ATTENDED`/`ABSENT`; actualReceived (chỉ đơn đặt hộ Guest) |
| CompleteRefundRequest | refundedAmount, refundedAt, transferReference, proofFileId (tùy chọn), note |
| RefundResponse | id, bookingId, reason (`MEMBER_CANCELLED`, `OWNER_REJECTED`, `OWNER_CANCELLED`, `APPROVAL_TIMEOUT`), amountDue, status, dueAt, ownerConfirmedAt, memberConfirmedAt, escalatedAt |
| RefundResolutionRequest | note, contactedParties |
| OwnerBookingResponse | Các trường của BookingResponse, thêm member {fullName, accountCode, phone} hoặc guest {fullName, dateOfBirth, phone}, actualReceived, resultDeadline, resultOverdue |
| CreateReviewRequest | rating 1–5, content, imageUploadIds (tối đa 5) |
| CreateDiscountCodeRequest | code, courtIds, validFrom, validTo, percentOff (1–100) |
| CreateAnnouncementRequest | title, content, imageUploadIds |
| ContentDecisionRequest | decision = `APPROVED`/`REJECTED`; reason bắt buộc khi từ chối |
| CreateBlacklistEntryRequest | memberAccountCode, relatedBookingId, debtAmount, reason |
| CreateReportRequest | title, content, relatedBookingId, attachmentUploadIds |
| PageResponse<T> | items, page, size, totalElements, totalPages |

## 8. Định dạng lỗi

Mọi API nội bộ trả lỗi dạng JSON với cấu trúc thống nhất; `errors` luôn là mảng (rỗng nếu lỗi không gắn với field). Frontend xử lý theo `code`, không so sánh `message`. Không đưa mật khẩu, token hay stack trace vào response lỗi.

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Dữ liệu gửi lên không hợp lệ.",
  "timestamp": "2026-11-28T16:10:00Z",
  "path": "/api/v1/bookings",
  "traceId": "b0784c62fa3a4b8e",
  "errors": [
    {
      "field": "endAt",
      "code": "INVALID_DURATION",
      "message": "Thời lượng đặt phải từ 60 đến 240 phút, theo bước 30 phút."
    }
  ]
}
```

| HTTP | Mã lỗi | Trường hợp |
|---|---|---|
| 400 | INVALID_JSON, VALIDATION_FAILED, INVALID_QUERY_PARAMETER | Sai JSON, sai kiểu, thiếu field, tham số ngoài giới hạn |
| 400 (theo field) | INVALID_DURATION, BOOKING_WINDOW_INVALID, OUTSIDE_OPENING_HOURS, GUEST_INFO_REQUIRED | Dữ liệu đơn không hợp lệ |
| 401 | AUTHENTICATION_REQUIRED, INVALID_CREDENTIALS, TOKEN_EXPIRED, INVALID_TOKEN | Chưa xác thực hoặc thông tin xác thực không hợp lệ |
| 403 | ACCESS_DENIED, EMAIL_NOT_VERIFIED, ACCOUNT_LOCKED, MEMBER_BLACKLISTED | Không có quyền thực hiện |
| 404 | RESOURCE_NOT_FOUND | Không tồn tại, hoặc là tài nguyên riêng của người khác |
| 409 | EMAIL_ALREADY_EXISTS, PHONE_ALREADY_EXISTS, OWNER_APPLICATION_PENDING, OWNER_VENUE_LIMIT | Tài khoản và hồ sơ chủ sân |
| 409 | BOOKING_SLOT_TAKEN, COURT_UNAVAILABLE, DISCOUNT_CODE_INVALID | Tạo đơn |
| 409 | BOOKING_INVALID_STATE, BOOKING_CANCELLATION_WINDOW_CLOSED, GUEST_BOOKING_ALREADY_STARTED | Hủy và chuyển trạng thái |
| 409 | APPROVAL_DEADLINE_PASSED, CONFIRMED_QUOTA_EXCEEDED, RESULT_WINDOW_CLOSED | Chủ sân xử lý đơn |
| 409 | PAYMENT_GRACE_NO_NEW_REQUEST, REFUND_AMOUNT_MISMATCH, REFUND_NOT_OWNER_CONFIRMED | Thanh toán và hoàn tiền |
| 409 | PRICE_RULE_CONFLICT, BLOCK_CONFLICTS_BOOKING | Bảng giá và lịch chặn |
| 409 | REVIEW_ALREADY_EXISTS, REVIEW_EDIT_WINDOW_CLOSED | Đánh giá |
| 409 | IDEMPOTENCY_KEY_REUSED, REQUEST_IN_PROGRESS | Gửi lại request không đúng quy ước |
| 413 | FILE_TOO_LARGE | Tệp quá lớn |
| 415 | UNSUPPORTED_MEDIA_TYPE | Loại tệp không hỗ trợ |
| 429 | RATE_LIMIT_EXCEEDED, LOGIN_TEMPORARILY_LOCKED | Quá tần suất hoặc khóa đăng nhập tạm thời; có header `Retry-After` |
| 500 | INTERNAL_ERROR | Lỗi không lường trước |
| 503 | SERVICE_UNAVAILABLE | Dịch vụ phụ thuộc tạm thời không hoạt động |

Lỗi đăng nhập không tiết lộ email có tồn tại hay không. Webhook và chuyển hướng OAuth2 có định dạng phản hồi riêng theo nhà cung cấp.

## 9. Tiêu chí nghiệm thu

Kiểm thử nghiệp vụ dùng các kịch bản AT-UCS-01…40 trong `Use-Case-Specification-DatSan-v3.md` (mục 7). Ngoài ra cần đạt:

| Nhóm | Kiểm tra |
|---|---|
| Đặt sân | Biên 60/240 phút, bước 30 phút; đặt trước đúng 3 giờ và đúng 30 ngày được chấp nhận, ngoài khoảng bị từ chối |
| Tranh chấp lịch | 100 request đồng thời vào cùng khung giờ chỉ 1 thành công; khoảng chồng một phần cũng bị chặn; đơn thành viên và đơn đặt hộ Guest dùng chung cơ chế; lịch chặn không đè lên đơn |
| Thời gian giữ chỗ | Sau 5 phút chuyển `PAYMENT_GRACE` và không tạo được yêu cầu thanh toán mới; webhook trong thời gian chờ vẫn chuyển `PAID`; sau 90 giây chuyển `EXPIRED` |
| Thanh toán | Chuyển đủ, thiếu, thừa, sai mã; webhook gửi lặp không ghi nhận hai lần |
| Duyệt đơn | Hai request duyệt đồng thời khi chỉ còn 1 suất hạn mức thì chỉ 1 thành công; quá hạn duyệt tự hủy và tạo hoàn tiền 12 giờ |
| Hủy và hoàn | Hủy trước đúng 12 giờ được chấp nhận, 11 giờ 59 phút bị từ chối; chỉ chuyển `REFUNDED` khi đủ hai xác nhận; hủy đơn đặt hộ Guest đúng `startAt` bị từ chối; lịch chỉ nhả một lần |
| Chốt kết quả | Chốt trước `endAt` hoặc sau `endAt + 24h` bị từ chối; đơn đặt hộ Guest không ra `NO_SHOW`; hoa hồng bằng 30% tiền thực nhận |
| Phân quyền | Không xem hoặc sửa được đơn của người khác; chủ sân không thao tác được địa điểm khác; quản trị viên không chốt kết quả; tài khoản bị khóa không dùng được phiên cũ |
| API | Các lỗi 400/401/403/404/409/429 cùng cấu trúc; không lộ Entity hay dữ liệu bí mật |
| Thời gian thực | Khách chưa đăng nhập không đăng ký được kênh lịch; kết nối lại tải đúng trạng thái |
| Tác vụ | Chạy lặp không đổi trạng thái hoặc gửi email nhiều lần; lỗi gửi email không rollback nghiệp vụ |

Hiệu năng cần đo trên staging với dữ liệu demo: p95 dưới 500 ms cho API nội bộ thông thường; sự kiện thời gian thực đến client trong 2 giây sau commit.

Dashboard chủ sân phân biệt tổng hóa đơn, tiền thực nhận, tiền đã hoàn và hoa hồng phải nộp. Không tính `HOLD`, `PAYMENT_GRACE` hay `PAID` chưa duyệt là doanh thu. Tỷ lệ lấp đầy tính số phút `CONFIRMED`/`COMPLETED`/`NO_SHOW` trên số phút mở cửa có thể bán (trừ lịch chặn). Mọi chỉ số ghi rõ khoảng thời gian lọc.

### Phân công hoàn thiện hợp đồng API

- **TV1:** OpenAPI tìm kiếm sân, đánh giá, ưu đãi và thông báo; điều chỉnh trang chủ theo Q09.
- **TV2:** OpenAPI đặt sân (đơn thành viên và đặt hộ Guest) và chuyển trạng thái; tác vụ A1–A3; migration các bảng đơn đặt sân.
- **TV3:** OpenAPI thanh toán, tiền thực nhận và hoàn tiền; tích hợp webhook SePay; tác vụ A4–A6; thông báo.
- **TV4:** OpenAPI địa điểm, sân con, bảng giá, lịch chặn, danh sách đen, thống kê và quản trị; giao diện chủ sân và quản trị.
- **TV5:** cập nhật auth/user theo Q02, Q03; API hồ sơ chủ sân, tải tệp và báo cáo; gộp OpenAPI và tổ chức buổi duyệt.

Danh sách duyệt: [ ] phạm vi và mức ưu tiên (mục 1); [ ] quyết định Q01–Q21; [ ] danh mục endpoint; [ ] DTO và mã lỗi; [ ] phân công.

## 10. Tổ chức mã nguồn backend

Backend là một ứng dụng Spring Boot, package gốc `vn.datsan.backend`, chia theo module nghiệp vụ. Mỗi module gồm `controller`, `service`, `repository`, `entity`, `dto`, và thêm `exception`, `scheduler` khi cần.

```text
vn/datsan/backend/
├── common/        # TV5: xử lý lỗi chung, cấu hình, filter, PageResponse
├── auth/          # TV5: đăng nhập, JWT, OAuth2, phiên
├── user/          # TV5: tài khoản, hồ sơ, hồ sơ chủ sân, tải tệp
├── report/        # TV5: báo cáo, khiếu nại
├── search/        # TV1: tìm kiếm sân
├── review/        # TV1: đánh giá
├── offer/         # TV1: mã giảm giá, thông báo, khuyến mãi
├── booking/       # TV2: đơn đặt sân, lịch, duyệt, chốt kết quả, đặt hộ Guest
├── realtime/      # TV2: WebSocket
├── payment/       # TV3: yêu cầu thanh toán, webhook, tiền thực nhận, hoàn tiền
├── notification/  # TV3: email, thông báo trong ứng dụng, nhắc việc
├── venue/         # TV4: địa điểm, sân con, giờ mở cửa, bảng giá, lịch chặn, danh sách đen
├── stats/         # TV4: thống kê, hoa hồng
└── admin/         # TV4: điều phối thao tác quản trị
```

| Package | Trách nhiệm | Không đặt ở đây |
|---|---|---|
| controller | Nhận request, kiểm tra cấu trúc DTO, gọi service, trả response | Tính giá, xử lý nghiệp vụ |
| service | Quy tắc nghiệp vụ, transaction, kiểm tra quyền sở hữu và trạng thái | Chi tiết hiển thị |
| repository | Đọc, ghi, truy vấn cơ sở dữ liệu | Quyết định luồng nghiệp vụ |
| entity | Mô hình lưu trữ, enum trạng thái của module | DTO trả ra ngoài |
| dto | Dữ liệu vào/ra của module | DTO của module khác |
| exception | Lỗi nghiệp vụ riêng, kế thừa `ApiException` | Cấu trúc JSON lỗi riêng |
| scheduler | Kích hoạt tác vụ định kỳ, gọi service | Sao chép logic của service |

### 10.1. Quyền sở hữu dữ liệu

| Dữ liệu (bảng) | Module sở hữu | Phối hợp |
|---|---|---|
| `users`, `user_roles`, `owner_applications`, `owner_application_documents`, `files` | user — TV5 | admin gọi service để duyệt hồ sơ và khóa tài khoản |
| `venues`, `venue_payout_accounts`, `sports`, `courts`, giờ mở cửa, bảng giá, `court_blocks`, `blacklist_entries`; `PricingService` | venue — TV4 | booking lấy giá, giờ mở cửa, danh sách đen; search đọc dữ liệu |
| `bookings`, `booking_invoices`, `booking_guest_details`, `booking_status_events` | booking — TV2 | giao diện chủ sân của TV4 gọi API booking |
| `payment_requests`, `payment_transactions`, `owner_receipts`, `refunds` | payment — TV3 | payment gọi `BookingService.markPaid`; booking gọi `RefundService.open` khi hủy |
| `commission_statements`, `commission_lines`, `commission_remittances` | stats — TV4 | đọc `owner_receipts`, `refunds` |
| `discount_codes`, `discount_code_courts`, `announcements` | offer — TV1 | `PricingService` áp mã giảm giá |
| `reviews` | review — TV1 | booking cung cấp điều kiện đơn `COMPLETED` |
| `reports`, `report_attachments` | report — TV5 | admin xử lý |
| `notifications` | notification — TV3 | các module gửi thông báo qua service |

Bảng `users`, `user_roles` tương ứng `accounts`, `account_roles` trong ERD.

### 10.2. Quy ước làm việc

- Mỗi entity chỉ định nghĩa ở một module. Module giao tiếp qua service, không gọi controller của nhau, không ghi qua repository của module khác, tránh phụ thuộc vòng.
- Không đưa nghiệp vụ đặt sân, tính giá, thanh toán vào `common`.
- Không sửa file Flyway đã chạy trên môi trường chung, chỉ thêm migration mới. TV2 điều phối số phiên bản migration (`V1` dùng cho auth/user).
- Thay đổi hợp đồng service hoặc entity mà người khác đang dùng phải trao đổi trước và cập nhật tài liệu trong cùng PR.

## 11. Ngoài phạm vi

Các chức năng sau không thiết kế API và không triển khai trong đồ án; có thể trình bày ở phần hướng phát triển của báo cáo.

| Chức năng | Ghi chú |
|---|---|
| Quản trị viên tiếp nhận hoặc chốt thay đơn chủ sân chốt trễ | OPEN-05 chưa chốt; hệ thống chỉ nhắc và đánh dấu quá hạn (Q08) |
| Xử lý tiền chuyển đến sau khi đơn `EXPIRED`/`CANCELLED` | Giả định không xảy ra (OPEN-07); giao dịch chỉ được lưu để tra cứu |
| Xóa tài khoản, thu hồi quyền chủ sân, bổ sung hồ sơ chủ sân | Nguồn chưa quy định |
| Xử lý đơn đang có khi lịch bảo trì, ẩn sân con hoặc danh sách đen phát sinh sau | Nguồn chưa quy định; API chặn thao tác gây xung đột thay vì tự hủy đơn |
| Điều chỉnh hoa hồng sau hoàn tiền, khóa sổ kỳ | Nguồn chưa quy định |
| Ghép kèo, đổi lịch, đặt định kỳ, cổng VNPay, check-in bằng QR, xuất Excel, đặt cọc | Không thuộc nghiệp vụ v3 |

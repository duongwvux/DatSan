# USE CASE SPECIFICATION — DAT SAN

**Phiên bản:** 3.0 (baseline phân tích)  
**Ngày:** 16/11/2026  
**Phạm vi:** Web đặt sân thể thao tại Hà Nội; 21 Use Case tổng quan (`UC-01`–`UC-21`) và 11 Use Case nghiệp vụ Booking & Payment (`B-01`–`B-11`).  
**Tài liệu đối chiếu:** `Use-Case-Diagram-DatSan.md` (danh mục/ID Use Case), `Business-Rules-Catalog-DatSan-v3.md` (BRC), `Role-Permission-Matrix-DatSan-v3.md`, `Booking-State-Machine-DatSan-v3.md`, `mo-ta-du-an.md`.  
**Thứ tự ưu tiên:** quyết định nghiệp vụ mới nhất → BRC/Role Matrix/State Machine v3 → danh mục Use Case → mô tả gốc. Những quy định cũ về **tiền cọc, thanh toán thiếu hoặc thu tiền mặt phần còn lại đối với Member Booking** đã bị thay thế.

> **Tình trạng:** Đây là bản đặc tả phân tích có thể dùng để review, thiết kế và phát triển. `[CHỐT]` là yêu cầu đã thống nhất; `[GỐC]` là yêu cầu ban đầu còn hiệu lực; `[ĐỀ XUẤT]` là cách triển khai/diễn giải cần xác nhận; `[OPEN]` là quyết định còn thiếu. Các tình huống OPEN **không được xem là chức năng đã phê duyệt**.

---

## 1. Giới hạn hệ thống, actor và quy ước

### 1.1. Actor

| Actor | Vai trò trong Use Case | Giới hạn |
|---|---|---|
| **Guest** | Khách chưa đăng nhập, tìm kiếm/xem thông tin công khai, đăng ký Member | Không tự tạo Booking, không xem cập nhật chi tiết trạng thái slot. Trong `OWNER_GUEST_BOOKING`, Guest là người được Owner nhập thông tin **chứ không phải actor thao tác trên web**. |
| **Member** | Tạo Booking trực tuyến, trả đủ 100% qua chuyển khoản, theo dõi/hủy, xác nhận hoàn tiền, đánh giá, báo cáo | Tuân thủ blacklist, thời hạn và trạng thái Booking. |
| **Owner** | Member được Admin cấp quyền Owner, quản lý Venue, duyệt đơn, đặt hộ Guest, hoàn tiền/chốt kết quả | **Kế thừa quyền Member**, quản lý tối đa **01 Venue**; chỉ thao tác dữ liệu của Venue mình khi dùng quyền Owner. Khi tự đặt sân như Member vẫn trả 100%. |
| **Administrator** | Duyệt Owner, quản lý người dùng/nội dung, xử lý báo cáo và Refund quá hạn | Không mặc nhiên có quyền tự tạo/sửa Booking hoặc chốt kết quả thay Owner. |
| **Payment Gateway** | External actor trả thông tin/xác nhận giao dịch chuyển khoản | Không có quyền duyệt/hủy Booking; hệ thống DatSan kiểm tra và đổi trạng thái. |

**Không tạo actor `DatSan System`, `Scheduler`, `Database`** trong sơ đồ Use Case vì chúng là thành phần bên trong system boundary. Với Use Case có tác vụ định thời, DatSan thực thi tự động theo Business Rule.

### 1.2. Loại Booking, trạng thái và quy tắc toàn cục

| Thuộc tính / quy tắc | Giá trị có hiệu lực |
|---|---|
| `booking_type` | `MEMBER_BOOKING` hoặc `OWNER_GUEST_BOOKING`. |
| Thanh toán Member | **100% giá trị hóa đơn sau ưu đãi bằng chuyển khoản**, xác thực qua Gateway trước khi vào `PAID`; **không có cọc**. |
| Luồng Member | `REGISTER → HOLD → [PAYMENT_GRACE] → PAID → CONFIRMED → COMPLETED/NO_SHOW` hoặc nhánh hủy/hết hạn. |
| Luồng Owner–Guest | `REGISTER → CONFIRMED`, **bỏ qua HOLD và PAID nhưng vẫn có hóa đơn đầy đủ**. |
| Trạng thái chiếm lịch | `HOLD`, `PAYMENT_GRACE`, `PAID`, `CONFIRMED`. |
| Trạng thái giải phóng lịch | `EXPIRED`, `CANCELLED`, `REFUNDED`; giải phóng **một lần** cho mỗi Booking. |
| Khung đặt | `3h ≤ starts_at − created_at ≤ 30 ngày`; tối thiểu 1h, tối đa 4h/đơn, bước 30 phút; mỗi đơn thuộc đúng 1 Court. Không còn giới hạn tổng 4h đặt liên tiếp. |
| Hạn mức | Tối đa **2 `MEMBER_BOOKING` có `status` hiện tại là `CONFIRMED`**, theo **ngày tạo Booking** của cùng Member; kiểm tra nguyên tử trước khi Owner duyệt. `PAID`, `CANCELLED`, `REFUNDED`, `COMPLETED`, `NO_SHOW` không nằm trong bộ đếm hiện tại. `OWNER_GUEST_BOOKING` không bị áp hạn mức. |
| Hạn duyệt | `approval_deadline = min(paid_at + 24h, starts_at − 2h)`; quá hạn vẫn `PAID` thì DatSan tự `CANCELLED`. |
| Member hủy | Từ `PAID`/`CONFIRMED` khi `now ≤ starts_at − 12h`; hoàn **100% tiền thực chuyển**, hạn **24h** kể từ `cancelled_at`. |
| Owner từ chối/hủy Member | Khi trạng thái hợp lệ, không bị mốc 12h của Member; hoàn **100% tiền Member đã chuyển**, hạn **12h**. Tự hủy vì quá hạn duyệt cũng dùng hạn 12h. |
| Hoàn tiền trễ | Quá hạn 12h/24h chuyển Admin; Admin xử lý trong **48h từ `escalated_at`**. |
| Owner hủy Owner–Guest | Chỉ khi **`now < starts_at`**. Chưa thu tiền: `CONFIRMED → CANCELLED`. Đã thu tiền và hoàn trả: `CONFIRMED → REFUNDED` **trực tiếp**, Owner chịu toàn bộ chi phí/rủi ro. |
| Chốt kết quả | Owner chốt trong `ends_at ≤ now ≤ ends_at + 24h`: Member có mặt → `COMPLETED`, vắng → `NO_SHOW`; Owner–Guest dù khách vắng vẫn → `COMPLETED`. |
| Phí nền tảng | **30% tiền Owner thực nhận** đối với đơn `COMPLETED` hoặc `NO_SHOW`, đối soát/thu theo tháng. Không coi tổng hóa đơn là tiền đã thu của Owner–Guest. |
| Chuyển khoản đến sau EXPIRED/CANCELLED | **Giả định không xảy ra** trong phạm vi phân tích hiện tại (OPEN-07 đã chốt theo giả định). |

### 1.3. Cấu trúc đặc tả

Mỗi Use Case nêu **Mục tiêu; Actor; Trigger; Tiền điều kiện; Luồng chính; Luồng thay thế/ngoại lệ; Hậu điều kiện; Dữ liệu/quy tắc liên quan**. Mô tả `UC-xx` là cấp hệ thống, còn `B-xx` ở mục 4 là đặc tả sâu cho Booking & Payment, **không phải 11 Use Case cộng thêm vào tổng 21 Use Case**.

**Quy ước thời gian:** `now` là thời gian server; `created_at` là lúc HOLD được tạo (Member) hoặc CONFIRMED được tạo (Owner–Guest), `paid_at` là lúc xác thực đủ tiền, `starts_at`/`ends_at` là thời gian chơi. `[ĐỀ XUẤT]` Dùng múi giờ `Asia/Ho_Chi_Minh` để xác định ngày lịch của hạn mức 2 đơn; BRC chưa chốt múi giờ ở mức chi tiết kỹ thuật.

**Phân biệt Use Case và trạng thái:** `PAID`, `CANCELLED`, `REFUNDED`... là **Booking states**, không là Use Case. Scheduler chạy timeout/nhắc việc là hành vi nội bộ, không là actor ngoài.

---

## 2. Danh mục và ánh xạ Use Case

| ID | Use Case | Actor chính | Phân rã Booking/Payment |
|---|---|---|---|
| UC-01 | Tra cứu sân và thông tin | Guest, Member | — |
| UC-02 | Đăng ký tài khoản | Guest | — |
| UC-03 | Quản lý tài khoản | Member | — |
| UC-04 | Nộp hồ sơ Owner | Member | — |
| UC-05 | Đặt sân trực tuyến | Member | B-01, B-02, B-11 |
| UC-06 | Thanh toán 100% qua chuyển khoản | Member (Gateway hỗ trợ) | B-02, B-11 |
| UC-07 | Quản lý đơn cá nhân | Member | B-03, B-04 |
| UC-08 | Đánh giá sân | Member | — |
| UC-09 | Gửi báo cáo / khiếu nại | Member | — |
| UC-10 | Quản lý địa điểm và sân con | Owner | — |
| UC-11 | Quản lý lịch sân và giá | Owner | — |
| UC-12 | Quản lý đơn tại sân | Owner | B-05, B-06, B-08, B-09 |
| UC-13 | Đặt sân hộ Guest | Owner | B-07, B-06, B-08 |
| UC-14 | Quản lý ưu đãi và thông báo | Owner | — |
| UC-15 | Quản lý danh sách đen | Owner | — |
| UC-16 | Theo dõi doanh thu và hoa hồng | Owner | B-08 (dữ liệu kết quả), B-09 (dữ liệu hoàn) |
| UC-17 | Duyệt hồ sơ Owner | Administrator | — |
| UC-18 | Quản lý tài khoản người dùng | Administrator | — |
| UC-19 | Duyệt ưu đãi và thông báo | Administrator | — |
| UC-20 | Xử lý báo cáo và hoàn tiền quá hạn | Administrator | B-10 |
| UC-21 | Cấu hình hệ thống | Administrator | — |

**Quan hệ Use Case:** Theo sơ đồ hiện có, `UC-05 <<include>> UC-06` để hoàn tất việc đặt sân Member; `B-01 <<include>> B-02` và `B-02 <<include>> B-11` trong sơ đồ chi tiết. `UC-13`/`B-07` **không include** thanh toán trực tuyến.

---

## 3. Đặc tả Use Case tổng quan (UC-01 – UC-21)

### UC-01 — Tra cứu sân và thông tin

- **Mục tiêu:** Tìm Venue/Court phù hợp và đọc thông tin công khai.
- **Actor chính:** Guest hoặc Member (Owner có thể dùng chức năng kế thừa Member).
- **Trigger:** Người dùng truy cập trang chủ, bản đồ hoặc trang tìm sân.
- **Tiền điều kiện:** Không yêu cầu đăng nhập để xem dữ liệu công khai.
- **Luồng chính:**
  1. Người dùng mở trang chủ/bản đồ hoặc nhập tiêu chí tìm kiếm.
  2. Hệ thống hiển thị các Venue/Court đang được công khai.
  3. Người dùng lọc theo môn thể thao, khu vực, khoảng giá hoặc đánh giá sao.
  4. Người dùng chọn Venue để xem tên, địa chỉ, bản đồ, thông tin liên hệ, dịch vụ, sân con, đánh giá và thông báo công khai.
  5. Member đăng nhập có thể truy cập thông tin lịch trống chi tiết theo quyền.
- **Thay thế/ngoại lệ:**
  - A1. Không có kết quả: thông báo và cho thay bộ lọc.
  - A2. Guest chọn xem chi tiết tình trạng slot hoặc tự đặt: hệ thống không cung cấp thông tin lịch đặt chi tiết, yêu cầu đăng nhập/đăng ký nếu muốn thực hiện chức năng Member.
- **Hậu điều kiện:** Không tạo Booking, không chiếm slot.
- **Dữ liệu:** Venue, Court, Sport, vị trí, giá, đánh giá, thông báo được duyệt.
- **Quy tắc:** BR-ACC-04, BR-VEN-01/03.

### UC-02 — Đăng ký tài khoản

- **Mục tiêu:** Guest trở thành Member.
- **Actor chính:** Guest.
- **Trigger:** Chọn đăng ký.
- **Tiền điều kiện:** Chưa có phiên đăng nhập Member hợp lệ.
- **Luồng chính:**
  1. Guest mở biểu mẫu đăng ký.
  2. Cung cấp họ tên, giới tính, ngày sinh, CCCD/ngày cấp, địa chỉ liên hệ, email, số điện thoại theo mô tả gốc.
  3. Hệ thống kiểm tra dữ liệu đầu vào và tính duy nhất của CCCD/số điện thoại.
  4. Nếu hợp lệ, tạo tài khoản Member và mã tài khoản riêng.
  5. Thông báo kết quả đăng ký.
- **Thay thế/ngoại lệ:**
  - A1. Trùng CCCD hoặc số điện thoại: từ chối và chỉ rõ trường cần điều chỉnh.
  - A2. Thiếu/không hợp lệ dữ liệu: không tạo tài khoản.
- **Hậu điều kiện:** Thành công: tài khoản Member được tạo, không tự có quyền Owner. Thất bại: không phát sinh tài khoản.
- **Dữ liệu:** Member profile, account identifier, thông tin định danh/liên hệ.
- **Quy tắc:** BR-ACC-01/05. `[OPEN — CHI TIẾT]` Cơ chế xác thực email/SĐT, chính sách mật khẩu và xử lý dữ liệu CCCD chưa được đặc tả trong nguồn.

### UC-03 — Quản lý tài khoản

- **Mục tiêu:** Member đăng nhập, khôi phục và quản lý thông tin/tình trạng tài khoản của mình.
- **Actor chính:** Member; Owner kế thừa; Administrator sử dụng cơ chế đăng nhập phù hợp tài khoản quản trị.
- **Trigger:** Chọn đăng nhập, hồ sơ, chỉnh sửa, khôi phục hoặc yêu cầu xóa tài khoản.
- **Tiền điều kiện:** Với thao tác sửa/xem riêng tư: đã xác thực; với đăng nhập/khôi phục: có tài khoản phù hợp.
- **Luồng chính:**
  1. Người dùng mở chức năng quản lý tài khoản.
  2. Hệ thống xác thực danh tính khi cần.
  3. Hiển thị hồ sơ và quyền đang được cấp.
  4. Người dùng cập nhật những trường được phép chỉnh sửa hoặc yêu cầu thao tác tài khoản.
  5. Hệ thống kiểm tra hợp lệ, lưu thay đổi và xác nhận.
- **Thay thế/ngoại lệ:**
  - A1. Sai thông tin đăng nhập/tài khoản bị khóa: từ chối truy cập.
  - A2. Khôi phục tài khoản: chuyển sang quy trình khôi phục danh tính; **chưa xác định chi tiết kênh xác thực**.
  - A3. Yêu cầu xóa tài khoản: tiếp nhận yêu cầu; **chưa chốt điều kiện xóa nếu còn Booking, Refund hoặc hồ sơ Owner**; không tự giả định xóa vật lý.
  - A4. Thay CCCD/số điện thoại trùng dữ liệu đã có: từ chối.
- **Hậu điều kiện:** Lưu cập nhật hợp lệ; không thay đổi quyền Owner khi chưa qua UC-17.
- **Quy tắc:** BR-ACC-01/05; quyền trong Role–Permission Matrix v3.

### UC-04 — Nộp hồ sơ Owner

- **Mục tiêu:** Member đề nghị cấp thêm quyền Owner.
- **Actor chính:** Member; Administrator xử lý ở UC-17.
- **Trigger:** Chọn đăng ký Owner.
- **Tiền điều kiện:** Member đăng nhập, chưa được cấp quyền Owner; thỏa quy tắc tối đa 1 Venue khi được duyệt.
- **Luồng chính:**
  1. Member mở hồ sơ đăng ký Owner.
  2. Nhập thông tin cá nhân/định danh, địa chỉ, số điện thoại, tài khoản nhận tiền.
  3. Nhập thông tin hộ kinh doanh và địa điểm/sân dự kiến: tên, loại hình, diện tích, địa chỉ, số sân, giờ hoạt động, tiện ích.
  4. Đính kèm giấy tờ pháp lý/địa điểm/cơ sở vật chất theo tài liệu gốc.
  5. Kiểm tra, xác nhận và gửi hồ sơ chờ Administrator xét duyệt.
- **Thay thế/ngoại lệ:**
  - A1. Thiếu thông tin/tài liệu bắt buộc: yêu cầu hoàn thiện trước khi gửi.
  - A2. Member đã được cấp Owner hoặc vượt giới hạn Venue: không tạo thêm quyền/địa điểm vượt chính sách.
  - A3. Administrator từ chối: kết quả được xử lý theo UC-17; không cấp quyền Owner.
- **Hậu điều kiện:** Hồ sơ nộp thành công ở trạng thái chờ xét duyệt; chưa cấp quyền Owner trước khi UC-17 phê duyệt.
- **Quy tắc:** BR-ACC-01/02; bộ thông tin hồ sơ Owner trong `mo-ta-du-an.md`. `[OPEN — CHI TIẾT]` Các trạng thái/điều kiện chỉnh sửa và nộp lại hồ sơ bị từ chối chưa có chính sách.

### UC-05 — Đặt sân trực tuyến

- **Mục tiêu:** Member đặt một Court trong khung giờ hợp lệ, chuyển khoản đủ tiền và chờ Owner duyệt.
- **Actor chính:** Member (Owner có thể dùng như Member). **Actor hỗ trợ:** Payment Gateway, Owner ở bước duyệt sau đó.
- **Trigger:** Member chọn đặt Court.
- **Tiền điều kiện:** Đã đăng nhập; Court có thể đặt, Member không bị blacklist tại Venue; khoảng chơi đáp ứng quy định; hệ thống có dữ liệu giá.
- **Luồng chính:**
  1. Member chọn Venue/Court, `starts_at`, `ends_at`, tối đa một mã giảm giá hợp lệ.
  2. Hệ thống kiểm tra dữ liệu và hiển thị tóm tắt hóa đơn sau ưu đãi.
  3. Member xác nhận; DatSan kiểm tra xung đột lịch và tạo `MEMBER_BOOKING` ở `HOLD` bằng thao tác khóa lịch nguyên tử.
  4. DatSan mở thanh toán chuyển khoản **100% hóa đơn**, bắt đầu 5 phút HOLD.
  5. UC-06 xác thực thanh toán đủ 100%; Booking chuyển `PAID`.
  6. Hệ thống ghi `paid_at`, thông báo Owner có đơn chờ duyệt; Owner xử lý theo UC-12/B-05.
- **Thay thế/ngoại lệ:**
  - A1. Court không trống, giờ không hợp lệ, mã giảm giá sai/hết quyền dùng, Member trong blacklist: không tạo HOLD; yêu cầu chọn lại.
  - A2. Member thay đổi lựa chọn trước xác nhận: tính lại hóa đơn.
  - A3. Chưa thanh toán sau 5 phút: `HOLD → PAYMENT_GRACE` trong 90 giây; không QR/giao dịch mới.
  - A4. Chưa được xác thực đủ tiền hết grace: `PAYMENT_GRACE → EXPIRED`, nhả lịch.
  - A5. Member chủ động hủy khi HOLD/grace chưa PAID: `CANCELLED`, nhả lịch; không Refund nếu chưa nhận tiền.
  - A6. Đã `PAID` nhưng Owner chưa duyệt hoặc từ chối: tiếp tục quy trình B-05 và Refund, **không đồng nghĩa đơn đã CONFIRMED**.
- **Hậu điều kiện:** Tối thiểu thành công đến bước thanh toán: `PAID` và vẫn chiếm lịch, chờ duyệt; nếu đã duyệt thì `CONFIRMED`; trường hợp timeout/hủy: `EXPIRED/CANCELLED` và giải phóng slot.
- **Quy tắc:** BR-BKG-01–03/06–10, BR-PAY-01–09, BR-APR-01–03; **phân rã** B-01/B-02/B-11. **Hạn mức 2 CONFIRMED kiểm tra khi Owner duyệt, không phải khi tạo HOLD.**

### UC-06 — Thanh toán 100% qua chuyển khoản

- **Mục tiêu:** Ghi nhận một giao dịch thanh toán đầy đủ, hợp lệ cho Member Booking.
- **Actor chính:** Member. **Actor hỗ trợ:** Payment Gateway (external).
- **Trigger:** Member đi đến bước thanh toán của một Booking đang `HOLD`/`PAYMENT_GRACE`.
- **Tiền điều kiện:** Có hóa đơn `booking_total` sau giảm giá, Booking còn trong thời gian nhận xác nhận hợp lệ.
- **Luồng chính:**
  1. Hệ thống cung cấp thông tin thanh toán/QR cho giao dịch của Booking trong `HOLD`.
  2. Member chuyển khoản **100%** số tiền trên hóa đơn tới tài khoản nhận tiền Owner.
  3. Payment Gateway cung cấp dữ liệu giao dịch/đối soát.
  4. Backend DatSan kiểm tra giao dịch đúng Booking, đủ tiền, chưa xử lý trùng và còn thời hạn; ghi nhận Payment.
  5. Booking chuyển `HOLD/PAYMENT_GRACE → PAID`, lưu `paid_at`, dừng đếm giữ chỗ.
- **Thay thế/ngoại lệ:**
  - A1. Giao dịch thiếu tiền, không khớp Booking, chưa xác thực: **không vào PAID**.
  - A2. Hết 5 phút: ẩn QR, vào `PAYMENT_GRACE`, chỉ đợi **giao dịch đã khởi tạo** thêm 90 giây.
  - A3. Hết 90 giây vẫn chưa đủ tiền: `EXPIRED`, giải phóng slot.
  - A4. Callback lặp: không ghi Payment/đổi trạng thái nhiều lần (**[ĐỀ XUẤT] idempotency triển khai**).
  - A5. Giao dịch tới sát ranh giới timeout: **OPEN-09** chưa chốt timestamp quyết định.
- **Hậu điều kiện:** Thành công: Booking `PAID`, xác nhận đủ 100%, không còn tiền mặt/phần còn lại. Thất bại/hết hạn: không có trạng thái `PAID` giả.
- **Quy tắc:** BR-PAY-01–09, BR-ACC-06. Đặt sân hộ Guest **không** chạy Use Case này ở bước tạo.

### UC-07 — Quản lý đơn cá nhân

- **Mục tiêu:** Member xem Booking và hủy hợp lệ, theo dõi Refund.
- **Actor chính:** Member.
- **Trigger:** Mở lịch sử đơn hoặc chọn hủy.
- **Tiền điều kiện:** Đã xác thực; Booking thuộc tài khoản Member.
- **Luồng chính:**
  1. Hệ thống liệt kê Booking và trạng thái hiện tại.
  2. Member chọn Booking để xem Court, giờ, tổng hóa đơn, thanh toán, tình trạng duyệt/hủy.
  3. Nếu muốn hủy Booking `PAID`/`CONFIRMED`, Member gửi yêu cầu khi `now ≤ starts_at−12h`.
  4. DatSan kiểm tra trạng thái và hạn hủy, chuyển `CANCELLED`, giải phóng slot.
  5. Tạo nghĩa vụ Refund **100% số Member đã chuyển**, hạn `cancelled_at + 24h`.
  6. Member theo dõi và xác nhận đã nhận hoàn tiền theo B-04.
- **Thay thế/ngoại lệ:**
  - A1. Booking `HOLD/PAYMENT_GRACE` chưa PAID: hủy trực tiếp, không Refund nếu chưa thu tiền.
  - A2. Đã quá mốc 12h hoặc trạng thái không cho hủy: từ chối thao tác; giữ nguyên Booking.
  - A3. Booking đã thanh toán không cho đổi giờ trực tiếp; muốn đổi phải tạo đơn mới và tuân thủ quy trình hủy phù hợp.
  - A4. Refund quá 24h: chuyển UC-20/B-10 để Admin giải quyết theo hạn 48h từ escalation.
- **Hậu điều kiện:** Booking hợp lệ được hủy, slot giải phóng; `CANCELLED → REFUNDED` **chỉ sau khi thực hoàn và có xác nhận Owner + Member**.
- **Quy tắc:** BR-CAN-01/03/04, BR-REF-01/03/04, BR-APR-05; B-03/B-04.

### UC-08 — Đánh giá sân

- **Mục tiêu:** Member đánh giá trải nghiệm sân đã sử dụng.
- **Actor chính:** Member.
- **Trigger:** Mở đánh giá cho một Booking đã hoàn thành.
- **Tiền điều kiện:** Có `MEMBER_BOOKING` của Member đang `COMPLETED`.
- **Luồng chính:**
  1. Member truy cập Booking `COMPLETED`.
  2. Hệ thống mở form đánh giá (sao 1–5 và nội dung phản hồi).
  3. Member gửi; hệ thống kiểm tra thông tin và gắn đánh giá với Booking/Court.
  4. Đánh giá được hiển thị theo chính sách nội dung công khai của hệ thống.
- **Thay thế/ngoại lệ:**
  - A1. Booking `NO_SHOW`, `CANCELLED`, `REFUNDED` hoặc chưa kết thúc: không cho đánh giá theo quy tắc hiện tại.
  - A2. Sao ngoài 1–5 hoặc dữ liệu không hợp lệ: không lưu.
- **Hậu điều kiện:** Có phản hồi hợp lệ gắn với Booking đã hoàn thành.
- **Quy tắc:** BR-END-08. `[OPEN — CHI TIẾT]` Chính sách một lần đánh giá/cho sửa/xóa đánh giá chưa chốt; không tự áp đặt.

### UC-09 — Gửi báo cáo / khiếu nại

- **Mục tiêu:** Member phản ánh vấn đề liên quan sân, tài khoản hoặc giao dịch.
- **Actor chính:** Member (Owner có thể sử dụng quyền Member).
- **Trigger:** Chọn gửi báo cáo.
- **Tiền điều kiện:** Đăng nhập.
- **Luồng chính:**
  1. Member mở biểu mẫu báo cáo.
  2. Nhập tên báo cáo, nội dung, dữ liệu liên quan (nếu có), đính kèm ảnh/PDF làm bằng chứng.
  3. Hệ thống kiểm tra đầu vào và lưu báo cáo.
  4. Ghi nhận báo cáo để Administrator xem/xử lý ở UC-20.
- **Thay thế/ngoại lệ:**
  - A1. Thiếu nội dung cơ bản hoặc tệp không đúng định dạng: yêu cầu bổ sung/sửa.
  - A2. Không có tệp bằng chứng: chỉ chặn nếu chính sách sau này bắt buộc (nguồn chưa quy định mọi báo cáo luôn cần tệp).
- **Hậu điều kiện:** Báo cáo được tạo để xử lý, không tự thay đổi Booking hoặc Refund.
- **Quy tắc:** BR-VEN-05, UC-20.

### UC-10 — Quản lý địa điểm và sân con

- **Mục tiêu:** Owner đăng ký, xem và cập nhật Venue/Court thuộc phạm vi mình quản lý.
- **Actor:** Owner. **Trigger:** Mở Dashboard quản lý địa điểm/sân.
- **Tiền điều kiện:** Có quyền Owner; mỗi Owner chỉ được quản lý tối đa một Venue.
- **Luồng chính:**
  1. Owner mở thông tin Venue và danh sách Court.
  2. Tạo hoặc sửa Court: tên, môn thể thao, vị trí, tiện ích, thông tin hoạt động.
  3. Hệ thống kiểm tra quyền sở hữu Venue và tính hợp lệ dữ liệu.
  4. Lưu và cập nhật thông tin được phép.
- **Thay thế/ngoại lệ:**
  - A1. Owner cố tạo Venue thứ hai: từ chối.
  - A2. Owner sửa Venue/Court của người khác hoặc gửi dữ liệu sai: từ chối.
  - A3. Owner ẩn Court ngừng sử dụng: cập nhật khả năng hiển thị/đặt mới; **[OPEN — CHI TIẾT]** chưa chốt cách xử lý các Booking đang tồn tại, không tự hủy chúng.
- **Hậu điều kiện:** Dữ liệu Venue/Court được cập nhật đúng phạm vi; Booking đang có không tự đổi trạng thái.
- **Dữ liệu/quy tắc:** Owner–Venue–Court; BR-ACC-02/03, BR-VEN-01.

### UC-11 — Quản lý lịch sân và giá

- **Mục tiêu:** Owner cập nhật giờ hoạt động, bảng giá, lịch bảo trì/sự cố.
- **Actor:** Owner. **Trigger:** Mở quản lý lịch hoặc giá.
- **Tiền điều kiện:** Court thuộc Venue Owner.
- **Luồng chính:**
  1. Owner chọn Court và xem lịch/khung giá.
  2. Chọn sửa giờ hoạt động, giá hoặc chặn khung giờ bảo trì.
  3. Hệ thống kiểm tra quyền, dữ liệu thời gian và khả năng đặt mới.
  4. Lưu thay đổi hợp lệ.
- **Thay thế/ngoại lệ:**
  - A1. Không sở hữu Court, giá/khung giờ sai: từ chối.
  - A2. Bảo trì trùng `HOLD/PAYMENT_GRACE/PAID/CONFIRMED`: **[OPEN — CHI TIẾT]** chưa có quyết định về các Booking đã tồn tại; không được âm thầm giải phóng/hủy chúng.
- **Hậu điều kiện:** Lịch/giá hợp lệ được lưu, áp dụng cho khả năng đặt mới phù hợp.
- **Quy tắc:** BR-VEN-01, BR-BKG-02/08/09.

### UC-12 — Quản lý đơn tại sân

- **Mục tiêu:** Owner duyệt, từ chối, hủy và chốt kết quả Booking thuộc Venue mình.
- **Actor:** Owner. **Trigger:** Có đơn `PAID` chờ duyệt, cần hủy, hoàn tiền hoặc chốt sau giờ chơi.
- **Tiền điều kiện:** Owner có quyền tại Venue, Booking thuộc Venue đó.
- **Luồng chính:**
  1. Owner mở danh sách Booking theo trạng thái, loại đơn và khung giờ.
  2. Chọn Booking cùng một thao tác: duyệt/từ chối Member đang `PAID`; hủy theo điều kiện; chốt kết quả sau `ends_at`.
  3. DatSan kiểm tra `booking_type`, `status`, Venue, deadline, quota.
  4. Thực hiện transition cho phép; lưu lý do, tiền thực nhận/hoàn tiền nếu có.
  5. Ghi nhận kết quả và cập nhật các bên.
- **Thay thế/ngoại lệ:**
  - A1. Duyệt sau `approval_deadline` hoặc quota 2 `CONFIRMED` đã đủ: **không cho duyệt**. Timeout được Scheduler xử lý; nếu đang PAID Owner có thể từ chối. Không tự suy ra một luồng Refund mới chỉ vì quota đủ.
  - A2. `PAID` quá hạn duyệt: tự `CANCELLED`, hoàn 100% trong 12h (trách nhiệm Owner).
  - A3. Owner từ chối/hủy Member Booking: `CANCELLED`, nhả lịch, hoàn 100% trong 12h.
  - A4. Owner hủy Owner–Guest trước `starts_at`: chưa thu → `CANCELLED`; đã thu **và hoàn** → `REFUNDED` trực tiếp.
  - A5. Owner hủy Owner–Guest khi `now ≥ starts_at`: từ chối.
  - A6. Khi chốt: Member có mặt → `COMPLETED`, vắng → `NO_SHOW`; Owner–Guest **vắng vẫn `COMPLETED`**.
  - A7. Owner chưa chốt sau `ends_at + 24h`: ghi nhận trễ; **[OPEN-05]** chuyển Admin chỉ là đề xuất, chưa cho Admin tự chốt.
- **Hậu điều kiện:** Booking đổi trạng thái theo State Machine v3; Refund được theo dõi độc lập khi phát sinh; audit được lưu.
- **Quy tắc:** BR-APR-01–06, BR-BKG-05/09/14, BR-CAN-02/04–06, BR-REF-02/06, BR-END-01–07; B-05/B-06/B-08/B-09.

### UC-13 — Đặt sân hộ Guest

- **Mục tiêu:** Owner tạo Booking cho khách không có tài khoản tại Venue của mình.
- **Actor:** Owner; Guest là người được đặt hộ, **không phải người thao tác web**.
- **Trigger:** Owner chọn "Đặt sân hộ Guest".
- **Tiền điều kiện:** Quyền Owner hợp lệ, Court thuộc Venue của Owner và còn trống.
- **Luồng chính:**
  1. Owner chọn Court và khung giờ, điền thông tin Booking thông thường.
  2. Nhập **họ tên, ngày sinh, số điện thoại Guest**.
  3. DatSan tính hóa đơn bình thường theo giá và tối đa một ưu đãi hợp lệ nếu áp dụng.
  4. Owner rà soát và xác nhận; DatSan kiểm tra quyền, thời lượng 1–4h theo bước 30 phút, thời gian đặt 3h–30 ngày, lịch không trùng.
  5. DatSan tạo `OWNER_GUEST_BOOKING`, khóa slot nguyên tử, chuyển **`REGISTER → CONFIRMED`**.
  6. Không yêu cầu chuyển khoản tại lúc tạo, không tự coi `booking_total` là tiền đã thu.
- **Thay thế/ngoại lệ:**
  - A1. Thiếu ba trường Guest hoặc trường Booking bắt buộc, sai Venue/giờ/lịch: từ chối.
  - A2. Guest vắng: Owner vẫn chốt `COMPLETED` khi hết giờ, tự chịu rủi ro; không dùng `NO_SHOW`.
  - A3. Owner hủy trước `starts_at`: chưa thu tiền → `CANCELLED`; đã thu và thực hoàn → `REFUNDED` trực tiếp.
  - A4. Hủy tại hoặc sau `starts_at`: từ chối.
- **Hậu điều kiện:** Đơn `CONFIRMED` có hóa đơn và giữ lịch, không qua HOLD/PAID; không tiêu hao quota của Member.
- **Quy tắc:** BR-BKG-01–03/08/09/11–14, BR-PAY-10/11, BR-CAN-05/06, BR-END-04/07; B-07.

### UC-14 — Quản lý ưu đãi và thông báo

- **Mục tiêu:** Owner gửi mã giảm giá, thông báo hoặc khuyến mãi để Admin duyệt.
- **Actor:** Owner; Administrator xử lý ở UC-19.
- **Trigger:** Owner chọn tạo ưu đãi/thông báo.
- **Tiền điều kiện:** Quyền Owner hợp lệ tại Venue.
- **Luồng chính:**
  1. Chọn loại nội dung (mã giảm giá, khuyến mãi, thông báo).
  2. Với mã giảm giá: nhập Court, thời gian áp dụng, phần trăm giảm trên tổng hóa đơn.
  3. Với thông báo: nhập nội dung và thời gian hiển thị theo yêu cầu.
  4. Owner gửi hồ sơ; DatSan lưu trạng thái chờ duyệt.
  5. Nội dung chỉ được áp dụng/hiển thị khi Admin phê duyệt ở UC-19.
- **Thay thế/ngoại lệ:**
  - A1. Thiếu dữ liệu, không có quyền tại Venue: từ chối.
  - A2. Admin từ chối: không công khai/áp dụng.
  - A3. Mã đã sử dụng cho Booking sau đó bị hủy: **không hoàn lượt mã**.
- **Hậu điều kiện:** Hồ sơ nội dung được nộp, chưa mặc nhiên phát hành.
- **Quy tắc:** BR-BKG-07, BR-VEN-02/03.

### UC-15 — Quản lý danh sách đen

- **Mục tiêu:** Owner thêm/gỡ Member khỏi blacklist trong Venue mình.
- **Actor:** Owner. **Trigger:** Chọn quản lý blacklist.
- **Tiền điều kiện:** Owner có quyền trên Venue; xác định được Member.
- **Luồng chính:**
  1. Owner mở danh sách đen và chọn Member.
  2. Nhập thông tin liên quan: tên, mã tài khoản, mã đơn vi phạm, khoản nợ nếu có và lý do.
  3. DatSan xác minh quyền của Owner rồi lưu mục blacklist.
  4. Member không được tạo Member Booking tại Venue đó đến khi Owner gỡ khỏi blacklist.
- **Thay thế/ngoại lệ:**
  - A1. Không tìm thấy Member, quyền không hợp lệ, dữ liệu sai: không lưu.
  - A2. Owner gỡ blacklist: dừng hiệu lực chặn cho Venue.
  - A3. Blacklist bổ sung sau khi Member đã có Booking: **[OPEN — CHI TIẾT]** không có quy tắc tự hủy đơn hiện hữu; không tự hủy.
- **Hậu điều kiện:** Trạng thái blacklist riêng Venue được cập nhật.
- **Quy tắc:** BR-BKG-06, BR-VEN-04.

### UC-16 — Theo dõi doanh thu và hoa hồng

- **Mục tiêu:** Owner xem doanh thu, thực thu, phí nền tảng phải nộp theo tháng.
- **Actor:** Owner. **Trigger:** Mở Dashboard doanh thu/kỳ báo cáo.
- **Tiền điều kiện:** Owner có quyền với Venue.
- **Luồng chính:**
  1. Owner chọn kỳ báo cáo.
  2. DatSan tổng hợp Booking, hóa đơn và dữ liệu tiền Owner thực nhận gắn với từng Booking.
  3. Với Booking `COMPLETED`/`NO_SHOW`, hệ thống tính **hoa hồng = 30% × actual_received**.
  4. Hiển thị khoản doanh thu và phí hoa hồng theo kỳ; lập dữ liệu thu phí hàng tháng.
- **Thay thế/ngoại lệ:**
  - A1. Owner–Guest có hóa đơn nhưng chưa thu tiền: `actual_received` có thể là 0, hoa hồng không được suy ra từ giá hóa đơn.
  - A2. Có hoàn tiền/điều chỉnh số thực thu: báo cáo dựa trên dữ liệu đã xác thực; **[OPEN — CHI TIẾT]** quy tắc bù trừ tháng và chứng từ thực thu chưa chốt.
  - A3. Không có dữ liệu: hiển thị giá trị tương ứng kỳ không phát sinh.
- **Hậu điều kiện:** Chỉ hiển thị kết quả, không tự chuyển trạng thái Booking.
- **Quy tắc:** BR-END-05/06/07, BR-PAY-07/10/11.

### UC-17 — Duyệt hồ sơ Owner

- **Mục tiêu:** Admin phê duyệt/từ chối yêu cầu cấp quyền Owner của Member.
- **Actor:** Administrator. **Trigger:** Có hồ sơ Owner nộp ở UC-04.
- **Tiền điều kiện:** Admin đã xác thực, có quyền xét duyệt; hồ sơ tồn tại.
- **Luồng chính:**
  1. Admin mở danh sách hồ sơ chờ duyệt.
  2. Kiểm tra thông tin cá nhân, hộ kinh doanh, Venue/Court và tài liệu đính kèm.
  3. Admin duyệt hoặc từ chối và ghi nhận quyết định.
  4. Nếu duyệt, DatSan **cấp thêm quyền Owner cho tài khoản Member hiện có**, không tạo tài khoản thứ hai.
  5. Hệ thống thông báo kết quả đến Member.
- **Thay thế/ngoại lệ:**
  - A1. Hồ sơ chưa đủ/không hợp lệ: từ chối hoặc yêu cầu bổ sung; **[OPEN — CHI TIẾT]** tình trạng hồ sơ bổ sung/nộp lại chưa chốt.
  - A2. Đã có quyền Owner/vi phạm giới hạn Venue: không cấp quyền trái quy tắc.
- **Hậu điều kiện:** Quyền Owner chỉ có sau khi Admin phê duyệt; mọi quyền Member vẫn còn.
- **Quy tắc:** BR-ACC-01/02; UC-04.

### UC-18 — Quản lý tài khoản người dùng

- **Mục tiêu:** Admin khóa/mở tài khoản và giám sát tình trạng tài khoản được phân quyền.
- **Actor:** Administrator. **Trigger:** Chọn tài khoản cần quản lý.
- **Tiền điều kiện:** Admin đã đăng nhập và có quyền thích hợp.
- **Luồng chính:**
  1. Tìm tài khoản theo thông tin quản trị.
  2. Xem tình trạng được phép và chọn khóa/mở.
  3. DatSan xác thực quyền, ghi nhận lý do/quyết định quản trị.
  4. Cập nhật tình trạng tài khoản, lưu dấu vết.
- **Thay thế/ngoại lệ:**
  - A1. Không tìm thấy tài khoản hoặc thiếu quyền: từ chối.
  - A2. Tài khoản có Booking/Refund tồn tại: **[OPEN — CHI TIẾT]** nguồn chưa quy định ảnh hưởng của việc khóa tới giao dịch; không tự hủy/xóa Booking hay Refund.
- **Hậu điều kiện:** Tình trạng truy cập thay đổi, dữ liệu Booking/Refund vẫn được lưu theo nghiệp vụ riêng.
- **Quy tắc:** Quyền Administrator trong mô tả gốc, Role Matrix v3.

### UC-19 — Duyệt ưu đãi và thông báo

- **Mục tiêu:** Admin kiểm duyệt mã giảm giá/thông báo trước khi phát hành.
- **Actor:** Administrator. **Trigger:** Có nội dung Owner gửi ở UC-14.
- **Tiền điều kiện:** Admin có quyền, hồ sơ nội dung đang chờ xét.
- **Luồng chính:**
  1. Xem nội dung chờ duyệt.
  2. Kiểm tra Court áp dụng, ưu đãi, thời gian và nội dung công khai.
  3. Chọn duyệt hoặc từ chối.
  4. Với nội dung được duyệt, hệ thống cho áp dụng hoặc hiển thị đúng phạm vi/thời hạn.
- **Thay thế/ngoại lệ:**
  - A1. Sai/thiếu nội dung: từ chối, không phát hành.
  - A2. Thông báo hết thời gian: kết thúc hiển thị; mô tả gốc quy định thời hạn đăng trên web **3 tháng**.
- **Hậu điều kiện:** Chỉ nội dung hợp lệ đã được duyệt mới xuất hiện/được áp dụng.
- **Quy tắc:** BR-VEN-02/03, BR-BKG-07.

### UC-20 — Xử lý báo cáo và hoàn tiền quá hạn

- **Mục tiêu:** Admin xử lý phản ánh và Refund vượt hạn thực hiện.
- **Actor:** Administrator. **Trigger:** Nhận báo cáo (UC-09) hoặc sự kiện Refund quá SLA.
- **Tiền điều kiện:** Admin đã xác thực, có quyền xử lý vụ việc.
- **Luồng chính:**
  1. Mở danh sách vụ việc và xem hồ sơ Booking/Refund/bằng chứng.
  2. Xác định loại Refund: Member hủy → **24h**; Owner từ chối/hủy Member hoặc hệ thống hủy vì Owner duyệt quá hạn → **12h** tính từ `cancelled_at`.
  3. Khi quá SLA, hệ thống ghi `escalated_at` và chuyển vụ việc cho Admin.
  4. Admin xử lý trong **48h kể từ `escalated_at`**; lưu kết quả và thông báo bên liên quan.
  5. Chỉ cập nhật `REFUNDED` khi có bằng chứng đã hoàn và các xác nhận cần thiết.
- **Thay thế/ngoại lệ:**
  - A1. Báo cáo chưa có kết quả xác minh: tiếp tục hồ sơ xử lý, không tự thay đổi Booking.
  - A2. Refund chưa hoàn hoặc chưa đủ xác nhận Owner + Member: `MEMBER_BOOKING` vẫn `CANCELLED`.
  - A3. Owner không chốt trong 24h sau `ends_at`: **[OPEN-05]** việc giao vụ việc sang Admin là **đề xuất**, chưa phải quyền đã chốt; Admin không được tự kết luận `COMPLETED/NO_SHOW`.
- **Hậu điều kiện:** Lưu kết quả xử lý theo quyền; Refund và Booking chỉ cập nhật khi đủ guard.
- **Quy tắc:** BR-APR-06, BR-REF-01–05, BR-END-09 (đề xuất), BR-VEN-05; B-10.

### UC-21 — Cấu hình hệ thống

- **Mục tiêu:** Admin thay đổi những cấu hình hệ thống được cho phép.
- **Actor:** Administrator. **Trigger:** Mở trang cấu hình.
- **Tiền điều kiện:** Có quyền cấu hình.
- **Luồng chính (khung):**
  1. Admin xem danh mục tham số cho phép.
  2. Chọn tham số và nhập giá trị mới.
  3. Hệ thống kiểm tra quyền, kiểu dữ liệu, ràng buộc.
  4. Nếu hợp lệ, lưu giá trị và lịch sử thay đổi.
- **Thay thế/ngoại lệ:**
  - A1. Không đủ quyền/giá trị sai: từ chối.
  - A2. Thay đổi mâu thuẫn BRC đã chốt: không tự cho phép. Các hằng số 5 phút, 90 giây, 12h/24h, 30%... **không mặc nhiên là tham số có thể tùy ý thay**.
- **Hậu điều kiện:** Chỉ cấu hình hợp lệ, được ủy quyền mới đổi.
- **Quy tắc:** Quyền Administrator trong mô tả gốc. **[OPEN — PHẠM VI]** Chưa có danh sách chính xác các tham số, quyền thay, cơ chế phê duyệt nên Use Case này chỉ là **đặc tả khung**.

---

## 4. Đặc tả chuyên sâu Booking & Payment (B-01 – B-11)

> `B-01`–`B-11` là phân rã từ sơ đồ chi tiết đã xây dựng. Các bước được mô tả đủ để viết API, kiểm thử luồng nghiệp vụ và kiểm tra State Machine. Tên trạng thái và guard tuân theo State Machine v3; **không bổ sung trạng thái riêng** khi nguồn không quy định.

### B-01 — Tạo đơn đặt sân (Member)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Member (Owner khi đặt như Member) |
| Hỗ trợ | DatSan kiểm tra lịch, giá, mã giảm giá |
| Liên hệ | UC-05; `<<include>> B-02` để hoàn tất quá trình thanh toán |
| Trigger | Nhấn xác nhận thông tin Booking |
| Tiền điều kiện | Đã đăng nhập, không thuộc blacklist Venue, Court tồn tại/được phép đặt |
| Hậu điều kiện thành công | Tạo đúng 1 `MEMBER_BOOKING` ở `HOLD`, hóa đơn cố định cho giao dịch, slot được chiếm và có hạn thanh toán |
| Hậu điều kiện thất bại | Không tạo HOLD chiếm lịch nếu điều kiện đặt sân không đạt |

**Luồng chính**

1. Member chọn đúng 1 Court, giờ bắt đầu/kết thúc theo bước 30 phút và tối đa 1 mã ưu đãi hợp lệ.
2. DatSan xác thực khoảng đặt **3 giờ đến 30 ngày**, thời lượng **1–4 giờ**, khả năng hoạt động Court và blacklist.
3. DatSan tính tổng hóa đơn sau ưu đãi và hiển thị thông tin để xác nhận.
4. Member xác nhận; backend kiểm tra lần cuối các điều kiện và **khóa slot nguyên tử** nhằm tránh đặt trùng.
5. Tạo Booking loại `MEMBER_BOOKING`, gán `created_at`/`hold_started_at`, trạng thái `HOLD`, hóa đơn và hạn thanh toán 5 phút.
6. Chuyển sang B-02 để chuyển khoản đủ 100%.

**Luồng thay thế/ngoại lệ**

- B01-A1: Thông tin sai/không đủ, 2 khoảng giờ chồng nhau hoặc Court bị khóa lịch: thông báo lỗi, không tạo Booking.
- B01-A2: Mã giảm giá không áp dụng, đã dùng hoặc không còn hợp lệ: tính lại không có mã nếu Member chấp nhận, nếu không thì quay lại chỉnh form.
- B01-A3: Member muốn đổi lịch sau `PAID`: **không cho sửa Booking đã thanh toán**; sử dụng luồng hủy và tạo đơn mới nếu còn hợp lệ.
- B01-A4: **Quota** `CONFIRMED` không phải guard cứng ở bước tạo HOLD; do các `PAID` chưa duyệt không tính quota. Có thể cảnh báo sớm `[ĐỀ XUẤT]`, nhưng **phải kiểm tra lại quota tại B-05**.

**Quy tắc và dữ liệu:** BR-BKG-01–10, BR-PAY-01; Booking, BookingLine/Invoice, Court, Venue, Voucher. `REGISTER` có thể chỉ là form/draft; trạng thái được lưu chính thức bắt đầu ở `HOLD` nếu không lưu draft.

### B-02 — Thanh toán 100% (Member)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Member |
| Actor hỗ trợ | Payment Gateway (B-11) |
| Liên hệ | UC-06, được `B-01 <<include>>` |
| Trigger | Booking ở `HOLD`, thành viên chuyển khoản theo thông tin do hệ thống hiển thị |
| Tiền điều kiện | `MEMBER_BOOKING`, còn thời gian đối soát, có `booking_total` sau ưu đãi |
| Hậu điều kiện thành công | `HOLD/PAYMENT_GRACE → PAID`, đã đối soát **đủ 100%**, lưu `paid_at`; slot vẫn chiếm |
| Hậu điều kiện hết hạn | `EXPIRED`, giải phóng lịch khi chưa có giao dịch 100% được xác thực hợp lệ |

**Luồng chính**

1. DatSan hiển thị thông tin chuyển khoản/QR giao dịch đang `HOLD`, số phải trả **đúng bằng 100% `booking_total`**.
2. Member thực hiện chuyển khoản đến Owner.
3. Gateway trả thông tin giao dịch; backend đối soát với Booking, giá trị tiền và trạng thái.
4. Nếu đủ tiền và hợp lệ, ghi Payment một lần, ghi `paid_at`, chuyển `PAID`; ngừng countdown, thông báo Owner chờ duyệt.

**Thay thế/ngoại lệ**

- B02-A1: Sau **5 phút** mà chưa ghi nhận đủ tiền: DatSan chuyển `HOLD → PAYMENT_GRACE` và **ẩn QR**.
- B02-A2: Trong **90 giây** grace: **chỉ** đối soát giao dịch đã khởi tạo; không cấp lại QR/khởi tạo thanh toán mới. Nếu xác thực đủ tiền → `PAID`.
- B02-A3: Hết grace (`hold_started_at + 6m30s`) vẫn chưa xác thực đủ tiền: `EXPIRED`, nhả lịch.
- B02-A4: Chuyển thiếu tiền, không khớp giao dịch, callback chưa xác thực: không vào `PAID` và **không có trạng thái cọc**.
- B02-A5: Member hủy khi chưa vào `PAID` (`HOLD` hoặc `PAYMENT_GRACE`): `CANCELLED`, nhả slot; không có Refund nếu hệ thống chưa ghi nhận tiền.
- B02-A6: Callback trùng: xử lý idempotent `[ĐỀ XUẤT — KỸ THUẬT]`; không tạo hai lần Payment.
- B02-A7: Sự kiện xác nhận/timeout rất sát deadline: `[OPEN-09]` **chưa chốt** lấy timestamp Gateway hay timestamp backend. Không tự đặt một quy tắc nghiệp vụ mới.

**Quy tắc:** BR-PAY-01–09, BR-ACC-06. **Giả định** không xảy ra chuyển khoản muộn sau `EXPIRED/CANCELLED` (OPEN-07); đây là giả định phạm vi, không là bảo đảm kỹ thuật.

### B-03 — Xem và hủy đơn (Member)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Member |
| Liên hệ | UC-07 |
| Trigger | Chọn một Booking trong lịch sử và nhấn hủy |
| Tiền điều kiện | Member được xác thực, Booking thuộc tài khoản mình |
| Hậu điều kiện thành công | Booking chuyển `CANCELLED`, slot giải phóng; nếu đã `PAID` phải mở nghĩa vụ hoàn 100% |

**Luồng chính**

1. Member mở danh sách Booking cá nhân và chọn xem chi tiết.
2. Với Booking `PAID` hoặc `CONFIRMED`, nhấn hủy.
3. Backend kiểm tra `now ≤ starts_at − 12h`; đồng thời kiểm tra trạng thái hiện tại.
4. Nếu hợp lệ: cập nhật `CANCELLED`, lưu `cancelled_at`, nhả lịch đúng một lần.
5. Ghi nghĩa vụ Refund **100% số đã chuyển** với hạn `cancelled_at + 24h`.
6. Hiển thị xác nhận hủy và tiến độ Refund, hỗ trợ B-04 sau khi nhận tiền hoàn.

**Thay thế/ngoại lệ**

- B03-A1: Đang `HOLD/PAYMENT_GRACE` và chưa ghi PAID: hủy, nhả chỗ **không yêu cầu hoàn tiền**.
- B03-A2: `now > starts_at−12h`: từ chối yêu cầu Member hủy; không thay đổi trạng thái.
- B03-A3: Đơn đã `CANCELLED/REFUNDED/EXPIRED/COMPLETED/NO_SHOW`: không chạy lại thao tác hủy.
- B03-A4: Thời gian/khung sân cần thay đổi sau PAID: không sửa trực tiếp; phải hủy theo điều kiện và đặt đơn mới.
- B03-A5: Refund 24h quá hạn: B-10 nhận xử lý, **không làm Booking tự thành REFUNDED**.

**Quy tắc:** BR-CAN-01/03/04, BR-REF-01/03/04; BR-BKG-09.

### B-04 — Xác nhận đã nhận hoàn tiền (Member)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Member |
| Liên hệ | UC-07; hỗ trợ B-09/B-10 |
| Trigger | Member nhận tiền hoàn và chọn xác nhận |
| Tiền điều kiện | `MEMBER_BOOKING` đã `CANCELLED`, có Refund đang theo dõi, Member là chủ Booking |
| Hậu điều kiện thành công | Khi **Owner và Member đều đã xác nhận** tiền đã thực hoàn, Booking `CANCELLED → REFUNDED` |

**Luồng chính**

1. DatSan hiển thị hồ sơ Refund (số tiền cần hoàn, số đã hoàn, thời điểm, tiến độ xác nhận).
2. Member kiểm tra tiền thực tế đã nhận ngoài hệ thống.
3. Member bấm xác nhận đã nhận đúng **100% số đã chuyển**.
4. DatSan ghi nhận xác nhận Member.
5. Nếu đã có xác nhận hoàn của Owner và bằng chứng/ghi nhận thực hoàn, cập nhật `REFUNDED` và thông báo hoàn tất.

**Thay thế/ngoại lệ**

- B04-A1: Member chưa nhận tiền/nhận thiếu: không xác nhận hoàn tất; tiếp tục chờ/tiếp nhận báo cáo theo phạm vi hiện có.
- B04-A2: Owner chưa xác nhận: Refund tiếp tục chờ, Booking vẫn `CANCELLED`.
- B04-A3: Refund quá SLA: B-10 xử lý.
- B04-A4: Owner–Guest không có Member Account: **không áp B-04**; nhánh hoàn trực tiếp theo B-06/B-09.

**Quy tắc:** BR-REF-01–05; BR-REF-06 (ngoại lệ Owner–Guest).

### B-05 — Duyệt / từ chối đơn Member (Owner)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Owner |
| Liên hệ | UC-12; State Machine T11/T12/T14 |
| Trigger | Owner mở danh sách Booking `PAID` chờ duyệt |
| Tiền điều kiện | Đã xác thực quyền Owner; Booking là `MEMBER_BOOKING`, `PAID` và thuộc Venue Owner |
| Hậu điều kiện duyệt | `PAID → CONFIRMED`, vẫn chiếm lịch; quota của Member theo ngày tạo tăng lên |
| Hậu điều kiện từ chối/quá hạn | `CANCELLED`, nhả lịch, Refund 100% trong 12h |

**Luồng duyệt chính**

1. Owner xem Booking `PAID`, hóa đơn đã trả đủ 100%, Court và giờ chơi.
2. Hệ thống tính `approval_deadline = min(paid_at + 24h, starts_at − 2h)`.
3. Owner chọn chấp nhận trước hoặc tại hạn duyệt được phép.
4. DatSan **trong cùng transaction** xác thực đúng Venue, trạng thái vẫn `PAID`, chưa quá hạn, và `confirmed_count(member_id, date(created_at)) < 2`.
5. Chuyển `CONFIRMED`, ghi nhận thời điểm/actor duyệt và thông báo Member.

**Thay thế/ngoại lệ**

- B05-A1: Owner chọn từ chối `PAID`: chuyển `CANCELLED`, ghi lý do; hoàn **100% số Member đã chuyển** theo SLA **12h**.
- B05-A2: Scheduler đến hạn duyệt mà Booking vẫn `PAID`: **tự `PAID → CANCELLED`**, nhả slot, mở Refund 100% SLA 12h (OPEN-01 đã chốt).
- B05-A3: `confirmed_count = 2` cho ngày tạo tương ứng: **không được duyệt thêm**. Có thể Owner từ chối hoặc Booking tiếp tục `PAID` tới deadline rồi tự hủy. **[OPEN — QUY TRÌNH NGOẠI LỆ]** chưa có quy tắc ép từ chối ngay vì hết quota; không tự hoàn tiền chỉ vì kết quả kiểm tra quota tại màn duyệt.
- B05-A4: Hai Owner/thao tác đồng thời làm tăng quota: chỉ một transaction được commit khi còn một suất; thao tác còn lại không thành `CONFIRMED` (`[ĐỀ XUẤT — KỸ THUẬT]` khóa nguyên tử).
- B05-A5: Member đã hủy hoặc Scheduler đã auto-hủy: Owner không thể duyệt Booking không còn `PAID`.
- B05-A6: Owner không có quyền Venue: từ chối thao tác.

**Quy tắc:** BR-BKG-05/14, BR-APR-01–06, BR-REF-02/03. **Không** tính `PAID` vào quota; Booking đang `COMPLETED/NO_SHOW` cũng không tính vào bộ đếm `CONFIRMED` hiện tại theo chính sách v3.

### B-06 — Hủy đơn tại sân (Owner)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Owner |
| Liên hệ | UC-12, UC-13; B-09 nếu phát sinh hoàn tiền |
| Trigger | Owner chọn từ chối/hủy Booking tại Venue |
| Tiền điều kiện | Booking thuộc Venue của Owner; trạng thái và loại Booking cho phép thao tác |
| Hậu điều kiện | `CANCELLED` hoặc `REFUNDED` trực tiếp tùy loại và tình trạng đã thu tiền; giải phóng slot đúng một lần |

**Luồng chính với Member Booking**

1. Owner chọn `MEMBER_BOOKING` ở `PAID` (từ chối) hoặc `CONFIRMED` (hủy).
2. DatSan xác thực quyền Venue và trạng thái; không áp giới hạn 12h của Member cho Owner.
3. Owner nhập lý do. DatSan chuyển `CANCELLED`, ghi `cancelled_at`, giải phóng lịch.
4. Đăng ký Refund **100% số Member đã chuyển** với deadline **12h** từ lúc hủy; chuyển B-09.

**Luồng thay thế — Owner–Guest**

- B06-A1: `OWNER_GUEST_BOOKING`, `now < starts_at`, **chưa thu tiền**: Owner hủy → `CONFIRMED → CANCELLED`, nhả lịch, không mở Refund.
- B06-A2: `OWNER_GUEST_BOOKING`, `now < starts_at`, **đã thu tiền**: Owner phải ghi nhận **thực tế đã hoàn số tiền thu** và dữ liệu hoàn tương ứng; sau khi đủ dữ liệu, Booking chuyển **`CONFIRMED → REFUNDED` trực tiếp** và nhả lịch. Owner chịu mọi rủi ro/chi phí; Guest không phải tài khoản Member và không cần thao tác xác nhận như B-04.
- B06-A3: Owner–Guest ở/sau `starts_at` (`now ≥ starts_at`): từ chối hủy, không chuyển `CANCELLED` hoặc `REFUNDED`.
- B06-A4: Member Booking đã `COMPLETED/NO_SHOW/REFUNDED/EXPIRED`: không áp dụng hủy thông thường khi không có transition hợp lệ.
- B06-A5: Từ chối/hủy không đủ quyền Venue hoặc không còn trạng thái cần thiết: không thay đổi Booking.
- B06-A6: Owner–Guest đã thu tiền nhưng **chưa hoàn thực tế**: chưa thể coi là `REFUNDED`; **[LƯU Ý THIẾT KẾ]** nhánh chuyển trực tiếp chỉ được ghi sau khi có bằng chứng hoàn, không tự chuyển trạng thái với một lời hứa hoàn.

**Quy tắc:** BR-CAN-02/04–06, BR-REF-02/06, BR-BKG-09; State T12/T16/T23/T24.

### B-07 — Đặt sân hộ Guest (Owner)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Owner |
| Người được phục vụ | Guest, không cần tạo tài khoản |
| Liên hệ | UC-13, không include B-02 |
| Trigger | Owner dùng chức năng tạo Booking hộ Guest tại Venue mình |
| Tiền điều kiện | Có quyền Owner, Court thuộc Venue mình; Court và giờ chơi hợp lệ |
| Hậu điều kiện thành công | Tạo `OWNER_GUEST_BOOKING` ở `CONFIRMED` với hóa đơn như thông thường, giữ lịch ngay |

**Luồng chính**

1. Owner nhập thông tin đặt sân như Member Booking: Court, khoảng thời gian, thông tin giá/ưu đãi nếu có.
2. Owner cung cấp ba trường **bắt buộc** của Guest: **họ tên, ngày sinh, số điện thoại**.
3. DatSan tính `booking_total` sau chính sách giá và tối đa một voucher hợp lệ.
4. Owner xác nhận. DatSan kiểm tra thời gian đặt 3h–30 ngày, thời lượng 1–4h, bước 30 phút, Court không trùng lịch và quyền Venue.
5. Trong một thao tác nguyên tử, DatSan tạo hóa đơn và Booking, chiếm slot, chuyển **`REGISTER → CONFIRMED`**; không tạo `HOLD`, không yêu cầu Gateway/`PAID`.
6. Hệ thống cho Owner theo dõi `actual_received` riêng với `booking_total` (không mặc định đã thu khi tạo).

**Thay thế/ngoại lệ**

- B07-A1: Thiếu một trong ba trường nhận diện Guest hoặc thiếu thông tin Booking: từ chối tạo.
- B07-A2: Court không thuộc Venue Owner, slot đã chiếm hoặc khung giờ sai: từ chối.
- B07-A3: Owner chọn đặt sân khác cho chính mình: phải tạo `MEMBER_BOOKING` qua B-01/B-02, không được lợi dụng nhánh Owner–Guest.
- B07-A4: Owner–Guest **không chịu quota 2 Member Booking**, vì không cùng loại Booking.
- B07-A5: Guest không đến khi buổi chơi kết thúc: B-08 chốt `COMPLETED`, Owner chịu rủi ro; **không** chuyển `NO_SHOW`.

**Quy tắc:** BR-BKG-01–03/08/09/11–14, BR-PAY-10/11, BR-END-04/07.

### B-08 — Chốt kết quả buổi chơi (Owner)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Owner |
| Liên hệ | UC-12, UC-13; dữ liệu cho UC-08 và UC-16 |
| Trigger | Buổi chơi kết thúc, Owner chọn chốt kết quả |
| Tiền điều kiện | Booking `CONFIRMED`, đúng Venue; `ends_at ≤ now ≤ ends_at + 24h` |
| Hậu điều kiện | Member Booking thành `COMPLETED/NO_SHOW`; Owner–Guest thành `COMPLETED`, ghi thực thu |

**Luồng chính**

1. DatSan hiển thị Booking `CONFIRMED` đã tới `ends_at` và chưa chốt.
2. Owner chọn Booking thuộc Venue mình, xem loại Booking.
3. Nếu **Member Booking**: ghi khách đã đến hoặc không đến.
4. DatSan cập nhật có mặt → `COMPLETED`, vắng → `NO_SHOW`.
5. Nếu **Owner–Guest Booking**: hệ thống cho chốt `COMPLETED` **dù Guest đến hay vắng**, lưu `actual_received` đúng số đã thực thu mà Owner chịu trách nhiệm.
6. DatSan dùng `actual_received` để tính 30% commission cho các Booking kết thúc `COMPLETED/NO_SHOW`, tổng hợp kỳ tháng.

**Thay thế/ngoại lệ**

- B08-A1: `now < ends_at`: không được chốt kết quả sớm.
- B08-A2: `now > ends_at + 24h`: đã quá hạn; **[OPEN-05]** nhắc Owner trong cửa sổ 24h là hướng xử lý, chuyển Admin sau hạn **chưa xác nhận**, không tự chốt kết quả hoặc thêm transition mới.
- B08-A3: Owner cố đặt `NO_SHOW` cho Owner–Guest: không cho phép, vì quy tắc bắt buộc `COMPLETED`.
- B08-A4: Booking đã `CANCELLED/REFUNDED/EXPIRED` hoặc đã chốt: không chốt lần nữa.
- B08-A5: Owner–Guest khách không đến và không trả tiền: `COMPLETED` với `actual_received` có thể là 0; commission = 0, Owner tự chịu rủi ro.

**Quy tắc:** BR-END-01–09, BR-PAY-08/10/11.

### B-09 — Thực hiện / xác nhận hoàn tiền (Owner)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Owner |
| Actor liên quan | Member xác nhận theo B-04; Guest không cần tài khoản để xác nhận kiểu Member |
| Liên hệ | UC-12, UC-07, B-06, B-04, B-10 |
| Trigger | Có nghĩa vụ Refund sau hủy/từ chối hoặc Owner hủy Owner–Guest đã thu tiền |
| Tiền điều kiện | Owner có trách nhiệm khoản hoàn, hồ sơ Booking/Refund tồn tại |
| Hậu điều kiện | Theo loại đơn: `MEMBER_BOOKING` hủy trước rồi `CANCELLED → REFUNDED` sau khi hoàn và đủ xác nhận; `OWNER_GUEST_BOOKING` có thể chuyển trực tiếp khi hoàn |

**Luồng chính với Member Booking**

1. DatSan hiển thị nghĩa vụ Refund sau `CANCELLED`, số phải hoàn bằng **100% tiền Member đã chuyển**.
2. Xác định hạn: Member tự hủy đúng hạn → **24h**; Owner từ chối/hủy hoặc tự hủy vì Owner không duyệt đúng hạn → **12h**, đều tính từ `cancelled_at`.
3. Owner chuyển lại khoản tiền phải hoàn tới Member ngoài hệ thống hoặc theo quy trình tiền đã thống nhất, ghi số tiền, thời điểm và chứng cứ.
4. Owner xác nhận đã thực hoàn trên DatSan.
5. Member kiểm tra thực nhận và xác nhận theo B-04.
6. Khi đủ xác nhận và dữ liệu hoàn thực tế: `CANCELLED → REFUNDED`; không giải phóng slot lần thứ hai.

**Thay thế/ngoại lệ**

- B09-A1: Member chưa xác nhận nhận đủ: Booking vẫn `CANCELLED`; Refund chưa hoàn tất.
- B09-A2: Hết SLA hoàn 12h/24h: hệ thống gửi vụ việc B-10; Admin xử lý trong 48h kể từ `escalated_at`.
- B09-A3: Owner–Guest đã thu tiền, Owner hủy trước `starts_at`: Owner hoàn số đã thu và ghi chứng từ; **sau khi thực hoàn**, chuyển trực tiếp **`CONFIRMED → REFUNDED`**; không cần xác nhận của Guest qua tài khoản Member, nhả lịch ngay.
- B09-A4: Owner–Guest chưa thu: hủy `CONFIRMED → CANCELLED`, **không có Refund**.
- B09-A5: Tiền thực hoàn chưa đầy đủ/không có bằng chứng: không ghi `REFUNDED` giả. `[OPEN — CHI TIẾT]` chuẩn chứng từ và cách ghi nhận hoàn cho Guest không có tài khoản chưa được đặc tả chi tiết.

**Quy tắc:** BR-REF-01–06, BR-CAN-05/06, BR-APR-06, BR-BKG-09.

### B-10 — Xử lý hoàn tiền quá hạn (Administrator)

| Thuộc tính | Đặc tả |
|---|---|
| Actor chính | Administrator |
| Liên hệ | UC-20 |
| Trigger | Refund chưa hoàn trong SLA 12h hoặc 24h |
| Tiền điều kiện | Có nghĩa vụ Refund được mở và đã vượt hạn theo nguyên nhân hủy |
| Hậu điều kiện | Vụ việc có kết quả giải quyết được ghi trong 48h từ escalation; Booking chỉ `REFUNDED` khi thực hoàn và đúng điều kiện xác nhận |

**Luồng chính**

1. Scheduler/DatSan phát hiện Refund quá hạn, lưu `escalated_at`.
2. Admin nhận hồ sơ Booking/Refund, số tiền gốc, nguyên nhân hủy, thời hạn, bằng chứng và xác nhận đã có.
3. Admin liên hệ/xử lý vụ việc theo quyền trong vòng **48h từ `escalated_at`**.
4. Cập nhật kết quả xử lý, thông báo Owner/Member.
5. Nếu đã thực hoàn và đủ xác nhận Member Booking, DatSan chuyển `CANCELLED → REFUNDED` theo guard; nếu chưa thì vẫn không tự đánh dấu hoàn tất.

**Thay thế/ngoại lệ**

- B10-A1: Hoàn tiền trong hạn trước khi escalate: không mở vụ việc quá hạn.
- B10-A2: Chưa chứng minh hoàn đủ: giữ hồ sơ Refund ở trạng thái chưa hoàn, không đổi Booking sang `REFUNDED`.
- B10-A3: Owner chưa chốt kết quả sau 24h: **[OPEN-05]** không tự đưa vào hàng đợi này khi chưa chốt quyền Admin nhận việc; hoàn tiền quá hạn khác nghiệp vụ chốt kết quả.
- B10-A4: Admin trực tiếp chuyển tiền hộ hay có quyền thay Owner xác nhận? **[OPEN — CHI TIẾT]** nguồn chưa quy định; không tự trao quyền thanh toán/đổi trạng thái sai guard.

**Quy tắc:** BR-REF-03/04/05, BR-APR-06; deadline `escalated_at + 48h`.

### B-11 — Đối soát giao dịch (Payment Gateway)

| Thuộc tính | Đặc tả |
|---|---|
| Actor bên ngoài | Payment Gateway |
| Hệ thống chịu trách nhiệm | DatSan backend |
| Liên hệ | UC-06, B-02 (`B-02 <<include>> B-11` theo sơ đồ hiện có) |
| Trigger | Dữ liệu giao dịch/chuyển khoản hợp lệ được Gateway phản hồi/webhook hoặc DatSan nhận kết quả đối soát |
| Tiền điều kiện | Có Payment/Booking Member cần đối soát, số tiền cần trả đã xác định |
| Hậu điều kiện thành công | Payment được đối chiếu hợp lệ, Booking `HOLD/PAYMENT_GRACE → PAID`; không có quyền Gateway tự duyệt đơn |

**Luồng chính**

1. DatSan tạo thông tin nhận dạng giao dịch gắn với một Booking (khi còn HOLD).
2. Gateway cung cấp dữ liệu giao dịch: mã tham chiếu, số tiền và kết quả chuyển khoản theo tích hợp thực tế.
3. DatSan đối chiếu với `booking_total` (100%), Booking liên kết, trạng thái `HOLD/PAYMENT_GRACE` và thời hạn hợp lệ.
4. Backend ghi nhận xác nhận giao dịch một lần và chuyển Booking thành `PAID`.
5. Backend gửi thông tin Booking chờ Owner duyệt.

**Thay thế/ngoại lệ**

- B11-A1: Chưa đủ tiền hoặc giao dịch không khớp: không vào `PAID`.
- B11-A2: Đang PAYMENT_GRACE: **không** mở QR/giao dịch mới, chỉ chờ đúng giao dịch hiện hành.
- B11-A3: Lặp webhook: xử lý idempotent `[ĐỀ XUẤT — KỸ THUẬT]`.
- B11-A4: Tranh chấp thứ tự timeout và callback gần ranh giới: `[OPEN-09]` chưa có chuẩn timestamp quyết định.
- B11-A5: Callback sau `EXPIRED/CANCELLED`: **ngoài phạm vi theo giả định OPEN-07**; không tự phát sinh chuyển trạng thái mới trong tài liệu này.

**Quy tắc:** BR-ACC-06, BR-PAY-01–09. **Ranh giới tích hợp:** BRC chỉ yêu cầu Gateway cung cấp dữ liệu để tự động đối soát; cơ chế webhook, VietQR hay nhà cung cấp cụ thể là thiết kế kỹ thuật, chưa chốt ở mức đặc tả nghiệp vụ.

---

## 5. Quy trình nội bộ tự động (không tạo Use Case actor mới)

| Tác vụ nội bộ DatSan | Điều kiện | Hành vi bắt buộc | Use Case liên quan |
|---|---|---|---|
| Hết 5 phút HOLD | Booking vẫn `HOLD`, chưa xác thực đủ 100% | Chuyển `PAYMENT_GRACE` 90 giây; ẩn QR, không khởi tạo giao dịch mới | B-02, B-11 |
| Hết 90 giây PAYMENT_GRACE | Booking còn `PAYMENT_GRACE`, chưa đối soát đủ 100% | `EXPIRED`, nhả slot | B-02, B-11 |
| Hết hạn Owner duyệt | Booking `PAID`, đến `min(paid_at+24h, starts_at−2h)` | Tự `CANCELLED`, nhả lịch, mở Refund 100%, SLA 12h | B-05, B-09 |
| Refund quá SLA | `CANCELLED` có nghĩa vụ hoàn chưa hoàn tất ở 12h/24h tùy nguyên nhân | Ghi `escalated_at`, chuyển Admin, hạn xử lý tiếp 48h | B-09, B-10 |
| Nhắc Owner chốt kết quả | Booking `CONFIRMED` đã kết thúc và chưa chốt trong 24h | Hướng triển khai nhắc Owner trong cửa sổ 24h **[OPEN-05: lịch nhắc cụ thể chưa chốt]** | B-08 |
| Chuyển Admin khi Owner chốt trễ | Quá `ends_at+24h` | **[OPEN-05] Đề xuất, chưa kích hoạt như chính sách chính thức**; không tự kết luận kết quả, không cấp quyền Admin chốt thay | B-08, UC-20 |
| Giải phóng slot | Booking chuyển sang `EXPIRED`, `CANCELLED` hoặc `REFUNDED` | Giải phóng một lần; `CANCELLED → REFUNDED` không làm lại; `CONFIRMED → REFUNDED` của Owner–Guest giải phóng ngay | B-03, B-05, B-06, B-09 |

**Yêu cầu nhất quán giao dịch `[ĐỀ XUẤT — KỸ THUẬT]`:** Kiểm tra slot và ghi Booking phải nguyên tử; các lần chuyển trạng thái phải xác thực lại status hiện tại; thay đổi quota ở `PAID → CONFIRMED` phải đồng bộ; webhook Payment phải idempotent. Đây là cách triển khai bảo vệ Business Rules, không phải actor hay trạng thái bổ sung.

## 6. Dữ liệu nghiệp vụ tối thiểu và tiêu chí hậu điều kiện

| Đối tượng | Dữ liệu liên quan tới Use Case | Phạm vi/ghi chú |
|---|---|---|
| `Account` / `Member` | account ID, họ tên, giới tính, ngày sinh, CCCD/ngày cấp, email, số điện thoại, địa chỉ, quyền, tình trạng | Nguồn gốc UC-02/03; bảo vệ dữ liệu nhạy cảm là yêu cầu thiết kế cần bổ sung sau. |
| `OwnerApplication` | Member nộp, thông tin hộ kinh doanh, giấy tờ, Venue dự kiến, kết quả Admin | UC-04/17; danh sách trạng thái hồ sơ chi tiết chưa chốt. |
| `Venue` | Owner quản lý, tên, địa chỉ, bản đồ, giờ hoạt động, dịch vụ, tình trạng hiển thị | Mỗi Owner tối đa 1 Venue. |
| `Court` | Venue, tên, môn, giá, giờ hoạt động, lịch bảo trì/khóa | Một Booking gắn đúng 1 Court. |
| `Booking` | booking ID, `booking_type`, Court, member ID hoặc Guest data, `status`, `created_at`, `starts_at`, `ends_at`, `paid_at`, `cancelled_at`, approval deadline | Không gộp trạng thái Booking với Payment/Refund. |
| `GuestInfo` | **họ tên, ngày sinh, số điện thoại** | Bắt buộc cho Owner–Guest, không yêu cầu tài khoản Guest. |
| `Invoice` / giá trị đơn | `booking_total` sau ưu đãi, mã giảm giá (tối đa một) | Có cho cả Member và Owner–Guest; hóa đơn không mặc định là tiền đã nhận. |
| `Payment` | Booking, số chuyển, mã đối soát/thời điểm, trạng thái giao dịch | Member trả 100% qua Gateway; Owner–Guest có ghi nhận thực thu riêng. |
| `Refund` | Booking, lý do, số phải hoàn/thực hoàn, deadline, xác nhận Owner/Member (nếu áp dụng), bằng chứng, `escalated_at` | Với Member xác nhận 2 bên; Owner–Guest đã thu và hoàn có thể vào `REFUNDED` trực tiếp, không cần Member account. |
| `Discount` | Venue/Court áp dụng, thời gian, phần trăm, tình trạng duyệt và sử dụng | Một mã/Booking; không hoàn lượt đã dùng khi hủy. |
| `Review`, `Report`, `Blacklist`, `Notification` | Chủ thể liên quan, nội dung, thời điểm và trạng thái phù hợp | Dữ liệu cho UC-08/09/14/15/19/20. |
| `actual_received`, `commission` | Tiền Owner thực nhận, `commission = 0.30 × actual_received` | Chỉ tính với Booking `COMPLETED/NO_SHOW`; hóa đơn Guest không suy ra thực thu. |

**Ghi chú thiết kế:** Đây là danh mục dữ liệu logic, **không** quy định bắt buộc tên bảng hay quan hệ CSDL cuối cùng. Tách Booking / Payment / Refund / Invoice là định hướng để giữ đúng ngữ nghĩa, không thay thế ERD chính thức.

## 7. Acceptance Criteria / kiểm thử nghiệp vụ

| ID | Áp dụng | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| AT-UCS-01 | UC-01 | Guest mở chi tiết Venue | Xem thông tin công khai nhưng không xem cập nhật slot riêng tư/không đặt sân. |
| AT-UCS-02 | UC-02 | Đăng ký trùng số điện thoại hoặc CCCD | Từ chối tạo Member. |
| AT-UCS-03 | UC-04/17 | Member nộp và Admin duyệt hồ sơ Owner | Member được **cấp thêm** quyền Owner, không tạo tài khoản mới. |
| AT-UCS-04 | UC-10 | Owner tạo Venue thứ hai | Bị từ chối. |
| AT-UCS-05 | B-01 | Member tạo Booking bắt đầu sau đúng 3h, thời lượng 1h | Chấp nhận nếu các điều kiện khác hợp lệ. |
| AT-UCS-06 | B-01 | Member tạo Booking bắt đầu trước hơn 30 ngày hoặc trong dưới 3h | Từ chối. |
| AT-UCS-07 | B-01 | Hai Member cùng đặt cùng Court và khoảng thời gian trùng | Tối đa một Booking chiếm lịch được tạo thành công. |
| AT-UCS-08 | B-01 | Đặt 4h30 một đơn hoặc không theo bước 30 phút | Từ chối. |
| AT-UCS-09 | B-01 | Nhiều Booking liên tiếp tổng trên 4h nhưng mỗi đơn 1–4h | Không từ chối chỉ vì tổng thời lượng liên tiếp vượt 4h. |
| AT-UCS-10 | B-01 | Member thuộc blacklist Venue | Không thể tạo Booking tại Venue đó. |
| AT-UCS-11 | B-02 | Member chuyển 40% hoặc 99% hóa đơn | Không chuyển `PAID`, không ghi nhận dưới dạng cọc. |
| AT-UCS-12 | B-02/B-11 | Gateway xác thực đủ 100% trong HOLD | `HOLD → PAID`, chỉ tạo một kết quả Payment hợp lệ. |
| AT-UCS-13 | B-02 | Hết 5 phút chưa xác nhận đủ tiền | `HOLD → PAYMENT_GRACE`; ẩn QR; không mở giao dịch mới. |
| AT-UCS-14 | B-02/B-11 | Giao dịch cũ được xác nhận đủ trong grace | `PAYMENT_GRACE → PAID`. |
| AT-UCS-15 | B-02 | Hết 90 giây grace chưa xác nhận | `EXPIRED`, giải phóng lịch. |
| AT-UCS-16 | B-03 | Member hủy khi còn HOLD, chưa PAID | `CANCELLED`, nhả slot, không mở Refund. |
| AT-UCS-17 | B-03 | Member hủy `PAID` đúng 12h trước `starts_at`, đã trả 1.000.000 đồng | `CANCELLED`, hoàn 1.000.000 đồng trong 24h. |
| AT-UCS-18 | B-03 | Member hủy `CONFIRMED` khi chỉ còn 11h59 trước giờ chơi | Từ chối hủy. |
| AT-UCS-19 | B-05 | Owner duyệt Member Booking còn PAID trước hạn và quota còn 1 | `CONFIRMED` và số đếm quota tăng. |
| AT-UCS-20 | B-05 | Member có 2 `CONFIRMED` theo cùng ngày tạo, có thêm `PAID` | Không cho duyệt đơn PAID thứ ba thành CONFIRMED. |
| AT-UCS-21 | B-05 | Một `CONFIRMED` cùng ngày tạo hủy thành `CANCELLED` | Chỉ số quota hiện tại giảm; có thể duyệt đơn khác nếu guard còn hợp lệ. |
| AT-UCS-22 | B-05 | Booking đã `PAID` sau đó `REFUNDED` | Không tính vào quota 2 `CONFIRMED`. |
| AT-UCS-23 | B-05 | Owner không duyệt trước `approval_deadline` | Auto `PAID → CANCELLED`, nhả slot, hoàn 100% trong 12h. |
| AT-UCS-24 | B-06 | Owner từ chối `PAID` Member Booking | `CANCELLED`; hạn hoàn 12h. |
| AT-UCS-25 | B-07 | Owner đặt hộ Guest thiếu tên/ngày sinh/SĐT | Không cho tạo `CONFIRMED`. |
| AT-UCS-26 | B-07 | Owner–Guest đủ thông tin, chưa thu tiền | Có hóa đơn, `REGISTER → CONFIRMED`, không qua HOLD/PAID, vẫn giữ slot. |
| AT-UCS-27 | B-06/B-09 | Owner–Guest chưa thu tiền, Owner hủy trước giờ | `CONFIRMED → CANCELLED`, nhả chỗ. |
| AT-UCS-28 | B-06/B-09 | Owner–Guest đã thu tiền, hoàn xong trước giờ, Owner hủy | `CONFIRMED → REFUNDED` trực tiếp, nhả slot đúng một lần. |
| AT-UCS-29 | B-06 | Owner–Guest hủy đúng thời điểm `now = starts_at` | Từ chối hủy. |
| AT-UCS-30 | B-08 | Member không đến | Owner chốt `NO_SHOW` trong 24h sau `ends_at`. |
| AT-UCS-31 | B-08 | Owner–Guest không đến, Owner thực thu 0 | Chốt `COMPLETED`; hoa hồng 0, Owner chịu rủi ro. |
| AT-UCS-32 | B-08 | Owner chưa chốt ở `ends_at + 24h` | Phát hiện chưa chốt/quá hạn; **không** auto COMPLETED/NO_SHOW; nhánh chuyển Admin chưa được chốt. |
| AT-UCS-33 | B-09/B-04 | Member Booking đã CANCELLED, Owner chuyển hoàn đủ và hai bên xác nhận | `CANCELLED → REFUNDED`, không nhả lịch lần hai. |
| AT-UCS-34 | B-09/B-10 | Refund Owner/hết hạn duyệt quá 12h | Escalate Admin, xử lý trong 48h kể từ `escalated_at`. |
| AT-UCS-35 | B-09/B-10 | Refund Member tự hủy quá 24h | Escalate Admin, xử lý trong 48h kể từ `escalated_at`. |
| AT-UCS-36 | UC-08 | Member có Booking `COMPLETED` gửi 5 sao và phản hồi | Lưu đánh giá gắn Booking/Court. |
| AT-UCS-37 | UC-14/19 | Owner gửi mã giảm giá chưa được Admin duyệt | Mã chưa được áp dụng vào Booking. |
| AT-UCS-38 | UC-15 | Member bị blacklist Venue A nhưng không ở Venue B | Bị chặn tự đặt ở A; không tự chặn ở B. |
| AT-UCS-39 | UC-16 | Owner–Guest COMPLETED có hóa đơn 1 triệu nhưng thực thu 200.000đ | Hoa hồng = 60.000đ, không phải 300.000đ. |
| AT-UCS-40 | UC-20 | Refund chưa thực hoàn nhưng đã quá SLA và Admin đang xử lý | Booking không được đánh dấu `REFUNDED` chỉ vì đã escalate. |

**Các trường hợp không chuyển thành test nghiệp vụ đã chốt:** callback tiền đến muộn sau `EXPIRED/CANCELLED` (OPEN-07 giả định không xảy ra); quyền Admin chốt thay Owner (OPEN-05 chưa chốt); chuẩn timestamp tranh chấp sát deadline (OPEN-09 chưa chốt). Test an toàn/khả năng phục hồi thực tế nên được bổ sung khi chuyển qua thiết kế kỹ thuật, nhưng không được tự xem là quy tắc kinh doanh đã thống nhất.

## 8. Ma trận truy vết yêu cầu (Traceability Matrix)

| Nhóm Business Rules | Use Case liên quan | Kiểm thử điển hình |
|---|---|---|
| BR-ACC-01/02/05/06 | UC-02/03/04/10/17, B-11 | AT-UCS-02/03/04 |
| BR-BKG-01–04/06/07 | UC-01/05/13/14/15, B-01/B-07 | AT-UCS-05–10/25/26 |
| BR-BKG-05/14 — quota chỉ CONFIRMED | UC-05/12, B-05 | AT-UCS-19–22 |
| BR-BKG-08–10 — giữ/nhả lịch và chống trùng | UC-05/07/12/13, B-01/03/05/06/07/09 | AT-UCS-07/15/27/28/33 |
| BR-BKG-11–13 — Owner–Guest | UC-13, B-07 | AT-UCS-25/26 |
| BR-PAY-01–09 — chuyển khoản 100% HOLD/GRACE | UC-05/06, B-01/02/11 | AT-UCS-11–16 |
| BR-PAY-10/11 — hóa đơn Owner–Guest | UC-13/16, B-07/B-08 | AT-UCS-26/31/39 |
| BR-APR-01–06 — hạn duyệt và auto hủy | UC-12, B-05/B-09 | AT-UCS-19/20/23 |
| BR-CAN-01–06 — hủy Member/Owner | UC-07/12/13, B-03/B-06 | AT-UCS-16–18/24/27–29 |
| BR-REF-01–06 — Refund và escalation | UC-07/12/20, B-04/B-09/B-10 | AT-UCS-17/23/28/33–35/40 |
| BR-END-01–09 — kết thúc và hoa hồng | UC-08/12/13/16, B-08 | AT-UCS-30–32/36/39 |
| BR-VEN-01–05 — địa điểm/nội dung/blacklist | UC-01/09/10/11/14/15/19/20 | AT-UCS-04/37/38 |

## 9. Quyết định chưa hoàn tất và phạm vi không tự mở rộng

| Mã / chủ đề | Tình trạng | Ảnh hưởng tới đặc tả |
|---|---|---|
| **OPEN-05** — chốt kết quả trễ | **Chưa chốt phần tự chuyển Admin** | Owner phải chốt trong 24h; cơ chế nhắc là hướng đã nêu nhưng lịch nhắc cụ thể chưa có; **không** mặc định Admin chốt thay Owner, không tự sinh trạng thái mới. |
| **OPEN-09** — callback và timeout đúng ranh giới | **Chưa chốt về kỹ thuật** | Cần quyết định lấy timestamp Gateway hay timestamp DatSan và xử lý giao dịch sát `HOLD/GRACE` để đảm bảo xác nhận nhất quán. |
| Hạn mức 2 `CONFIRMED` nhưng còn nhiều `PAID` | **Thiếu quy trình ngoại lệ** | Owner không được duyệt vượt quota; việc bắt buộc từ chối ngay hay giữ PAID tới deadline chưa được chốt, không gán Refund tự động ngoài nhánh từ chối/timeout đã có. |
| Owner–Guest đã thu tiền nhưng chưa hoàn tại thời điểm bấm hủy | **Ràng buộc ngữ nghĩa trạng thái** | Đã chốt đi thẳng `CONFIRMED → REFUNDED`; để giữ nghĩa "đã hoàn" cần xác nhận khoản hoàn thực tế trước khi chuyển; không tự thêm một trạng thái trung gian. |
| Hồ sơ tài khoản/Owner | **Chi tiết còn thiếu** | Chưa có chính sách đăng nhập/khôi phục/xóa, vòng xử lý hồ sơ xin bổ sung, thu hồi quyền Owner. |
| Quản lý lịch và Venue | **Chi tiết còn thiếu** | Cần quy tắc bảo trì trùng Booking đã giữ chỗ và ẩn Court có đơn tồn tại. |
| Thu phí thực nhận/Refund Guest | **Chi tiết còn thiếu** | Cần cơ chế xác nhận `actual_received`, chứng cứ Owner hoàn cho Guest, điều chỉnh hoa hồng nếu hoàn tiền hoặc kỳ kế toán đã khóa. |
| Quản lý đánh giá, mã khuyến mãi, báo cáo | **Chi tiết còn thiếu** | Chưa chốt số lần sửa đánh giá, kiểm duyệt đánh giá, chỉnh sửa mã khuyến mãi đã duyệt, quy trình tranh chấp. |
| UC-21 Cấu hình hệ thống | **Chưa đủ phạm vi** | Chưa có danh mục tham số và quyền thay; không mặc định có thể sửa mọi Business Rule. |

**Quyết định đã chốt, không đưa lại vào OPEN:** OPEN-01 (Refund timeout duyệt 12h), OPEN-02 (Member hủy hoàn 100%), OPEN-03 (chỉ đếm status hiện tại CONFIRMED), OPEN-04 (Guest bắt buộc họ tên/ngày sinh/điện thoại), OPEN-06 (hóa đơn Owner–Guest như thường), OPEN-07 (giả định tiền vào muộn không xảy ra), OPEN-08 (Owner–Guest chỉ hủy trước `starts_at`), OPEN-10 (đã thu và hoàn → `CONFIRMED → REFUNDED` trực tiếp).

---

## 10. Checklist nghiệm thu đặc tả trước khi thiết kế ERD / API

- [x] Giữ đúng **21 UC tổng quan** và **11 B-UC phân rã** từ sơ đồ đã thống nhất.
- [x] Mỗi UC có actor, mục tiêu, trigger, tiền điều kiện, luồng chính, ngoại lệ, hậu điều kiện và tham chiếu Business Rules.
- [x] Owner kế thừa Member; Payment Gateway là external actor; hệ thống/Scheduler không là actor ngoài.
- [x] Member chuyển khoản **100%** giá trị hóa đơn; không tiền cọc, không thanh toán phần còn lại.
- [x] Hai loại Booking với các luồng vào `CONFIRMED` khác nhau.
- [x] Giữ lịch ở HOLD/PAYMENT_GRACE/PAID/CONFIRMED; nhả ở EXPIRED/CANCELLED/REFUNDED.
- [x] Hạn đặt, hủy, duyệt, hoàn, chốt kết quả và quota đúng BRC v3.
- [x] Owner–Guest có hóa đơn bình thường, Guest có ba trường nhận diện bắt buộc, không cần Gateway khi tạo.
- [x] Owner–Guest đã thu tiền và hoàn: `CONFIRMED → REFUNDED` trực tiếp; khách vắng vẫn `COMPLETED`.
- [x] Test tiêu biểu và liên kết UC ↔ BR ↔ acceptance criteria.
- [ ] Chốt OPEN-05, OPEN-09 và các chi tiết còn thiếu ở mục 9 trước khi triển khai chức năng tương ứng.

**Kết luận:** Đây là đặc tả chức năng **phù hợp baseline v3 hiện tại**, không phải tuyên bố tất cả chính sách nghiệp vụ/chi tiết kỹ thuật đã được phê duyệt. Đặc biệt, Booking/Payment/Refund có thể bắt đầu phân rã API và domain model, nhưng những nhánh còn OPEN phải được thiết kế dưới trạng thái chờ quyết định chứ không được tự suy luận thành business rule mới.

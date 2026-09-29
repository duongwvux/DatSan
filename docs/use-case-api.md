# Chốt chức năng, use case và quy ước API

Phiên bản: 1.0 — 28/09/2026  
Dự án: Website đặt sân thể thao — nhóm 5 thành viên  
Nguồn: `dac-ta-chuc-nang.md` (phạm vi chức năng) và `ke-hoach-do-an-dat-san-java.md` (kế hoạch 8 tuần).  
Trạng thái: Bản cơ sở đề xuất để nhóm duyệt và triển khai. Chưa có xác nhận duyệt của các thành viên. Các quyết định bổ sung được đánh dấu Qxx; không mặc nhiên xem là yêu cầu có sẵn trong nguồn.

## 1. Phạm vi và thứ tự ưu tiên

Đặc tả chức năng mới là cơ sở về phạm vi; khi khác kế hoạch cũ, giữ mức ưu tiên của đặc tả mới. Không tự nâng ghép kèo, VNPay hay đổi lịch thành bắt buộc.

| Người | Bắt buộc | Nên có, sau luồng lõi | Tùy chọn, ngoài cam kết 8 tuần |
|---|---|---|---|
| TV1 | F10–F13, F50 | F14, F51, F52 | — |
| TV2 | F20–F24 | F25, F26 | F27 |
| TV3 | F30, F31, F40–F42 | F32, F33 | F34 |
| TV4 | F70–F75, F80, F81 | F76, F82–F85 | F77 |
| TV5 | F01–F05 | F60–F62 | F63 |

- S01, S02: TV2; S03: TV3. S04: TV5, chỉ triển khai nếu có ghép kèo.
- N01–N06 giữ trong phạm vi: bảo mật, rate limit, kiểm tra đầu vào, hiệu năng, realtime, toàn vẹn lịch, responsive/PWA. TV1 phụ trách PWA.
- TV5 còn phụ trách khung backend, CI/CD, Docker, triển khai, điều phối và E2E.
- Mốc 04/10: hợp đồng OpenAPI được duyệt, hệ thống khung chạy bằng Docker Compose.
- Mốc 25/10: tìm sân → giữ chỗ → QR → nhận webhook → PAID trên staging.
- Mốc 08/11: khóa tính năng. Mốc 22/11: bàn giao.

## 2. Quyết định nghiệp vụ đề xuất cần đưa vào biên bản duyệt

| Mã | Quyết định dùng trong bản này | Lý do/ảnh hưởng |
|---|---|---|
| Q01 | Chọn link xác thực email, hết hạn 24 giờ, dùng một lần; chưa xác thực không được tạo đơn | F01 cho lựa chọn OTP hoặc link, chưa quy định thời hạn |
| Q02 | Một tài khoản có tập vai trò; duyệt OWNER bổ sung quyền OWNER và giữ PLAYER; không có API công khai tự cấp ADMIN | Chủ sân vẫn có thể đặt sân; tránh tự nâng quyền |
| Q03 | Chỉ nhận thanh toán đủ, đúng mã, xác thực hợp lệ trước `expiresAt` để chuyển HOLD → PAID; dùng thời điểm server tiếp nhận giao dịch hợp lệ làm mốc | Xử lý nhất quán webhook đến muộn, kể cả tiền chuyển trước nhưng thông báo đến sau |
| Q04 | Thanh toán thiếu không gia hạn HOLD, không chốt sân; không cộng dồn nhiều lần chuyển trong bản demo. Khoản lệch, thừa, muộn hoặc trùng tiền thực tế được đưa vào đối soát/hoàn thủ công | F31 chưa quy định chuyển thừa và cộng dồn |
| Q05 | Tiền online do ADMIN/đơn vị vận hành nền tảng hoàn; tiền CASH do OWNER sở hữu sân hoàn. OWNER xem/yêu cầu hoàn khoản online, không tự xác nhận đã hoàn | Giải quyết xung đột R07 với mô tả REFUNDED/F76 |
| Q06 | F76 vẫn là nên có; tối thiểu bắt buộc lưu yêu cầu hoàn và xuất/tra cứu được để đối soát thủ công. Nếu chưa có màn hình hoàn, khoản đó giữ CANCELLED/chờ xử lý, không giả lập REFUNDED | F24 và F31 bắt buộc đã phát sinh tiền cần hoàn |
| Q07 | PAID đã chốt sân, không cần chủ sân duyệt thêm. Thao tác chủ sân là ghi nhận khách đến hoặc NO_SHOW | Làm rõ “xác nhận đơn” trong kế hoạch cũ |
| Q08 | Check-in thủ công là phần F74 bắt buộc; QR F25 là nên có. NO_SHOW chỉ từ giờ bắt đầu đến trước giờ kết thúc, khi chưa check-in; S02 hoàn thành sau giờ kết thúc | Tránh S02 và NO_SHOW tranh chấp; quá giờ không sửa ngược COMPLETED trong bản demo |
| Q09 | Cho phép hủy HOLD trước hạn, giải phóng chỗ, không hoàn nếu chưa nhận tiền; quy tắc 24 giờ áp dụng hủy PAID | Bổ sung thao tác bỏ giữ chỗ |
| Q10 | Mỗi đơn tối đa một kèo; hủy đơn đóng kèo ngay. Phê duyệt tham gia phải kiểm tra số chỗ trong transaction | Đảm bảo kèo không tách khỏi đơn và không vượt số người |
| Q11 | Giá ngày lễ > giá theo thứ trong tuần > giá mặc định; trong cùng mức ưu tiên không cho tạo khoảng giá chồng lấn | Thay “cụ thể hơn” bằng thứ tự kiểm tra được |
| Q12 | Mốc 14 ngày tính theo ngày địa phương: ngày bắt đầu không sau hôm nay + 14 ngày; thời điểm bắt đầu phải ở tương lai. Bản đầu không đặt xuyên ngày | Làm rõ biên thời gian R01/R02 |

Q01–Q12 (và Q13–Q18 ở mục 5.3) là lựa chọn thiết kế đề xuất, có thể điều chỉnh trong buổi duyệt trước khi nhóm viết code phụ thuộc.

## 3. Quy tắc nền và trạng thái

### 3.1. Quy tắc thời gian, giá và quyền

- Múi giờ nghiệp vụ: `Asia/Ho_Chi_Minh`. Server là nguồn thời gian chuẩn.
- Bước đặt sân 30 phút; bắt đầu/kết thúc phải đúng biên :00 hoặc :30. Thời lượng từ 60 đến 240 phút, liên tiếp, trên cùng một sân con, trong giờ mở cửa và không bảo trì.
- Khoảng thời gian có dạng [startAt, endAt): hai đơn nối tiếp ở cùng mốc giờ không trùng nhau.
- Giữ chỗ 5 phút tính từ thời điểm tạo thành công; tối đa 2 HOLD còn hiệu lực/tài khoản. Kiểm tra giới hạn phải an toàn khi gửi request đồng thời.
- `now >= expiresAt` là hết hạn ngay cả khi S01 chưa chạy. Cả đường đọc lịch, tạo đơn và thanh toán phải hiểu cùng quy tắc.
- Giá do backend tính theo từng đoạn 30 phút; lưu ảnh chụp giá tại thời điểm HOLD, không đổi theo bảng giá sửa sau đó. Frontend chỉ gửi lựa chọn, không quyết định tổng tiền.
- Chỉ người sở hữu đơn được xem/hủy đơn cá nhân; OWNER thao tác đơn/sân thuộc cơ sở mình; ADMIN thao tác đúng chức năng quản trị. Không suy ra ADMIN được sửa mọi nghiệp vụ tùy ý.
- R05: hủy PAID được khi `startAt - now >= 24 giờ`, bao gồm đúng 24 giờ.
- R06: chủ đơn COMPLETED được đánh giá một lần/đơn; sửa trong 7 × 24 giờ từ lúc tạo đánh giá; sao là số nguyên 1–5.
- Đơn CASH tại quầy chỉ sang PAID khi OWNER xác nhận đã thu đủ tiền; vẫn kiểm tra thời lượng, khả dụng và chống trùng như online. Khách vãng lai không bắt buộc có tài khoản.

### 3.2. Bảng chuyển trạng thái đơn

| Từ | Sang | Điều kiện và người thực hiện | Hậu quả |
|---|---|---|---|
| — | HOLD | PLAYER hợp lệ tạo đơn online | Giữ toàn bộ các ô; ghi giá và expiresAt |
| — | PAID | OWNER tạo đơn tại quầy, đã thu CASH | Chiếm toàn bộ ô; ghi người thao tác |
| HOLD | PAID | Giao dịch đủ tiền hợp lệ, xử lý trước hạn | Ghi thanh toán; gửi thông báo sau commit |
| HOLD | EXPIRED | Hết hạn; S01 hoặc xử lý đồng bộ | Giải phóng chỗ; khoản nhận muộn xử lý riêng |
| HOLD | CANCELLED | Chủ đơn bỏ giữ chỗ trước hạn | Giải phóng chỗ; không mặc định có khoản hoàn |
| PAID | CANCELLED | Chủ đơn hủy đủ 24 giờ | Giải phóng chỗ, tạo yêu cầu hoàn đủ số tiền đã thu |
| CANCELLED | REFUNDED | Đã hoàn đủ, đúng thẩm quyền Q05, có tham chiếu bằng chứng | Ghi audit và thời điểm hoàn |
| PAID | NO_SHOW | OWNER đánh dấu theo Q08 | Không tự hoàn tiền; không cho đánh giá |
| PAID | COMPLETED | S02 sau endAt nếu vẫn PAID | Cho đánh giá, không cần thêm phê duyệt |

Không tự chuyển EXPIRED/CANCELLED về PAID khi có webhook muộn. Không có API sửa trạng thái tùy ý. S02 không đụng vào NO_SHOW. Trạng thái và chiếm chỗ phải thay đổi trong cùng transaction; sự kiện realtime chỉ phát sau commit.

### 3.3. Thanh toán và hoàn tiền tách khỏi trạng thái đơn

- `BookingStatus`: HOLD, PAID, COMPLETED, EXPIRED, CANCELLED, REFUNDED, NO_SHOW.
- `PaymentStatus` đề xuất: PENDING, SUCCEEDED, FAILED, REQUIRES_REVIEW, REFUNDED.
- Khoản đã thực nhận nhưng chưa hợp lệ để chốt đơn dùng REQUIRES_REVIEW và `reviewReason`: UNDERPAID, OVERPAID, LATE_PAYMENT, DUPLICATE_PAYMENT, UNMATCHED_BOOKING.
- `RefundStatus`: PENDING, PROCESSING, COMPLETED, REJECTED; không có khoản hoàn trả `refund: null`.
- Một đơn có thể có nhiều lần thử/giao dịch thanh toán; mỗi giao dịch ngoài hệ thống được lưu một lần theo cặp (provider, transactionId).
- Webhook gửi lại cùng giao dịch: không tạo thêm tiền/đơn/sự kiện. Một giao dịch mới chuyển vào đơn đã PAID là khoản cần đối soát, không phải webhook lặp.
- Đơn EXPIRED nhận tiền muộn vẫn EXPIRED; trạng thái hoàn nằm ở khoản thanh toán/refund. Không bắt buộc chuyển đơn đó sang REFUNDED.
- Không lưu số thẻ, bí mật nhà cung cấp hoặc token vào response/log công khai. Raw webhook chỉ cho quản trị được phép xem và cần che thông tin nhạy cảm.

## 4. Danh mục use case

Hệ thống thanh toán và dịch vụ email là tác nhân ngoài; tác vụ tự động là hành vi nội bộ theo lịch. OWNER được thực hiện use case PLAYER khi tài khoản có vai trò PLAYER.

| UC | Tác nhân | Mục tiêu và mã chức năng | Điều kiện/kết quả chính |
|---|---|---|---|
| UC01 | Khách | Đăng ký, xác thực email — F01 | Email duy nhất, mật khẩu ≥8; xác thực bằng link |
| UC02 | Khách/người dùng | Đăng nhập, refresh, logout — F02 | Google hoặc mật khẩu; access 15 phút, refresh 7 ngày; 5 lần sai liên tiếp khóa 15 phút |
| UC03 | Khách | Quên/đặt lại mật khẩu — F03 | Link 15 phút, một lần; thu hồi phiên sau đổi mật khẩu |
| UC04 | Người dùng | Sửa hồ sơ/đổi mật khẩu — F04 | Chỉ hồ sơ mình; không được sửa roles/status qua DTO |
| UC05 | PLAYER, ADMIN | Nộp và duyệt hồ sơ chủ sân — F05, F80 | Admin chấp nhận hoặc từ chối có lý do; giấy tờ không công khai |
| UC06 | Khách/PLAYER | Xem trang chủ, tìm sân, bản đồ, chi tiết — F10–F13 | Không cần đăng nhập; chỉ sân được hiển thị; thiếu tọa độ thì không sắp theo khoảng cách |
| UC07 | PLAYER | Lưu/xóa sân yêu thích — F14 | Nên có; một bản ghi/tài khoản/cụm sân |
| UC08 | Khách/PLAYER | Xem lịch, chọn thời gian, báo giá — F20, F21 | Giá tạm tính, không giữ chỗ |
| UC09 | PLAYER | Tạo đơn HOLD — F22 | Email xác thực, đủ điều kiện thời gian; giữ nguyên tử mọi ô |
| UC10 | PLAYER | Xem lịch sử/chi tiết, hủy đơn — F23, F24 | Đúng chủ đơn; hủy theo trạng thái và R05 |
| UC11 | PLAYER, OWNER | Check-in QR — F25 | Nên có; check-in thủ công nằm ở UC22 |
| UC12 | PLAYER | Đổi lịch/đặt định kỳ — F26, F27 | Nên có/tùy chọn; cần đặc tả bổ sung về chênh lệch giá trước triển khai |
| UC13 | PLAYER, nhà cung cấp thanh toán | Hiển thị QR, nhận thanh toán — F30, F31 | Chữ ký/cơ chế xác thực đúng tài liệu nhà cung cấp; khớp đơn, tiền, hạn |
| UC14 | PLAYER, VNPay | Thanh toán VNPay, biên nhận — F32, F33 | Nên có; trang return không tự xác nhận tiền |
| UC15 | PLAYER, OWNER | Xem/đọc thông báo, nhận email — F40–F42 | Thông báo riêng đúng người; không gửi lặp |
| UC16 | PLAYER | Viết/sửa đánh giá — F50 | COMPLETED, chủ đơn, một đánh giá/đơn, sửa trong 7 ngày |
| UC17 | OWNER/PLAYER/ADMIN | Phản hồi/báo cáo/kiểm duyệt đánh giá — F51, F52, F82 | Nên có; đúng chủ sân và quyền xử lý |
| UC18 | PLAYER | Tạo, tìm, xin tham gia, duyệt kèo — F60–F62 | Nên có; đơn PAID, chưa bắt đầu; chống vượt số người |
| UC19 | Thành viên kèo | Chat — F63 | Tùy chọn; chỉ thành viên hợp lệ |
| UC20 | OWNER | Quản lý cụm sân/sân con/giá — F70–F72 | Đúng chủ sở hữu; giá không mơ hồ; bảo trì không xóa đơn đã trả tiền |
| UC21 | OWNER | Tạo đơn tại quầy, chặn lịch — F73 | Chống trùng với online; chặn lịch xung đột trả lỗi |
| UC22 | OWNER | Lịch tuần, check-in thủ công, NO_SHOW — F74 | Đơn thuộc sân mình; tuân theo Q08 |
| UC23 | OWNER | Dashboard — F75 | Doanh thu và đối soát tách biệt; không đếm HOLD là doanh thu |
| UC24 | OWNER/ADMIN | Hoàn tiền thủ công — F76 | Nên có; phân trách nhiệm theo Q05; kiểm tra chống xác nhận lặp |
| UC25 | OWNER | Xuất Excel — F77 | Tùy chọn |
| UC26 | ADMIN | Khóa/mở tài khoản — F81 | Có lý do/audit; chặn phiên tài khoản bị khóa ở backend |
| UC27 | PLAYER/ADMIN | Khiếu nại, thống kê, nhật ký — F83–F85 | Nên có; chủ đơn gửi khiếu nại; admin xử lý |
| UC28 | Hệ thống | Hết hạn và hoàn thành đơn — S01, S02 | 30 giây/5 phút; thao tác có điều kiện và chạy lặp an toàn |
| UC29 | Hệ thống | Nhắc lịch — S03 | Mỗi 5 phút; gửi một lần khi đến mốc trước 2 giờ; đơn đặt sát giờ gửi ở lượt quét kế tiếp trước startAt |
| UC30 | Hệ thống | Đóng kèo — S04 | Mỗi 15 phút; ngừng nhận đơn tham gia ngay từ startAt, không chờ scheduler |
| UC31 | OWNER/PLAYER | Đặt cọc — F34 | Tùy chọn; không dùng trong mô hình thu toàn bộ tiền của bản lõi |

### 4.1. Luồng chi tiết UC09 — tạo đơn

1. PLAYER chọn sân và khoảng liên tiếp; frontend hiển thị báo giá từ backend.
2. Gửi yêu cầu kèm Idempotency-Key, không gửi giá cuối cùng hoặc trạng thái.
3. Backend xác thực tài khoản, email, thời gian, sân hoạt động, quyền đặt và số HOLD.
4. Trong transaction, kiểm tra/chiếm toàn bộ slot chống trùng, tính và lưu giá, tạo HOLD + expiresAt.
5. Commit rồi trả 201; phát thay đổi lịch và mở màn thanh toán.
6. Nếu bất kỳ slot nào bị chiếm: rollback toàn bộ, trả 409 BOOKING_SLOT_TAKEN.
7. Nếu retry cùng key và cùng nội dung: trả kết quả đã lưu, không tạo đơn mới. Key cũ với nội dung khác: 409 IDEMPOTENCY_KEY_REUSED.

Hậu điều kiện: hoặc tất cả slot thuộc đơn, hoặc không có slot nào được giữ bởi yêu cầu thất bại. Unique chỉ trên giờ bắt đầu đơn là không đủ vì các khoảng có thể chồng lấn; TV2 chọn ràng buộc/khóa bao phủ từng ô 30 phút hoặc khoảng thời gian.

### 4.2. Luồng chi tiết UC13 — nhận thanh toán

1. TV3 tạo QR từ số tiền và mã đơn backend; không cho người dùng thay mã đối soát.
2. Nhà cung cấp gửi webhook; backend xác thực theo đúng giao thức đã tích hợp.
3. Lưu giao dịch ngoài hệ thống với khóa chống trùng; khóa/kiểm tra có điều kiện trạng thái đơn liên quan.
4. Đúng mã, đủ tiền, HOLD còn hạn: ghi SUCCEEDED và PAID nguyên tử.
5. Sau commit: gửi sự kiện riêng cho chủ đơn, thông báo/email; frontend tải lại chi tiết đơn.
6. Thiếu/thừa/muộn/không khớp: lưu REQUIRES_REVIEW, không chốt sân, tạo công việc đối soát.
7. Webhook lặp đã xử lý: trả acknowledgement thành công theo giao thức nhà cung cấp; không phát lại tác dụng phụ.

Nếu S01 và webhook đồng thời: transaction/điều kiện cập nhật đảm bảo chỉ một chuyển trạng thái thắng. Mất kết nối realtime không làm mất kết quả; GET chi tiết đơn là nguồn kiểm tra cuối cùng.

### 4.3. Luồng chi tiết UC10/UC24 — hủy và hoàn

1. Chủ đơn gửi yêu cầu hủy; backend kiểm tra sở hữu và trạng thái.
2. HOLD còn hạn: CANCELLED, trả chỗ; PAID đủ 24 giờ: CANCELLED, trả chỗ, tạo refund PENDING.
3. PAID dưới 24 giờ: 409 BOOKING_CANCELLATION_WINDOW_CLOSED. Trạng thái khác không hợp lệ: 409 BOOKING_INVALID_STATE.
4. Thông báo cho chủ sân và người chơi sau commit.
5. Khi F76 có: người có thẩm quyền chuyển tiền ngoài hệ thống, nhập tham chiếu/bằng chứng; backend ghi audit và hoàn tất refund, chuyển CANCELLED → REFUNDED khi đã hoàn đủ.
6. Retry không tạo thêm khoản hoàn; không gọi dịch vụ hoàn tiền tự động trong bản này.

### 4.4. Luồng chi tiết UC05 — cấp quyền chủ sân

PLAYER nộp hồ sơ → trạng thái PENDING → ADMIN xem giấy tờ riêng tư → APPROVED (cấp OWNER) hoặc REJECTED (có lý do). Không chấp nhận `roles` từ yêu cầu nộp hồ sơ; không cấp quyền trước khi duyệt. F05/API hồ sơ do TV5; API duyệt và giao diện admin do TV4, cùng dùng một mô hình trạng thái.

## 5. Quy ước API chung

Đây là hợp đồng thiết kế của dự án, chưa phải mô tả API đã được triển khai.

| Hạng mục | Quy ước |
|---|---|
| Base path | `/api/v1` |
| Tên đường dẫn | Danh từ số nhiều, chữ thường; từ ghép dùng kebab-case |
| JSON | UTF-8, thuộc tính camelCase; enum UPPER_SNAKE_CASE |
| GET | Đọc, không thay đổi dữ liệu |
| POST | Tạo hoặc thực hiện hành động có nghiệp vụ; không dùng GET để hủy/hoàn |
| PATCH | Cập nhật một phần; không cho gán trạng thái nghiệp vụ tùy ý |
| DELETE | Xóa liên kết/tài nguyên được phép; sân có lịch sử dùng ẩn thay vì xóa cứng |
| ID | UUID biểu diễn chuỗi trong API; bookingCode là mã đối soát riêng, không phải bằng chứng có quyền truy cập |
| Thời gian | Timestamp RFC 3339 có offset, response chuẩn UTC `Z`; ngày thuần `YYYY-MM-DD`, giờ mở cửa `HH:mm` |
| Tiền | Số nguyên VND, `currency: "VND"`; backend dùng kiểu chính xác, không dùng float/double cho tiền |
| Phân trang | `page=0`, `size=20`, tối đa 100; giá trị ngoài giới hạn trả 400 |
| Sắp xếp | `sort=createdAt,desc`, có thể lặp; allowlist theo endpoint, thêm id để ổn định thứ tự |
| Xác thực | Access JWT qua Authorization: Bearer; quyền sở hữu kiểm tra ở backend |
| Refresh | Đề xuất cookie HttpOnly, Secure ở HTTPS; rotate khi refresh, lưu hash phía server, phát hiện reuse/thu hồi phiên. Cookie-auth endpoint phải kiểm tra Origin/CSRF; chính sách SameSite chốt theo topology deploy |
| PATCH null | Thiếu field: giữ nguyên; null: xóa chỉ với field cho phép; chuỗi rỗng không đồng nghĩa null |
| Version | Thay đổi tương thích được bổ sung trong v1; đổi tên/xóa field hoặc đổi ý nghĩa cần thông báo và cập nhật hợp đồng trước |
| Tài liệu | Một OpenAPI chung tại `docs/openapi.yaml`; mỗi API ghi quyền, DTO, ví dụ, lỗi và yêu cầu idempotency |

### 5.1. Response thành công

Không bọc thêm `success`/`data` cho tài nguyên đơn. POST tạo mới trả 201 và Location; GET/PATCH trả 200; thao tác không có body trả 204. Đăng nhập/refresh trả 200; quên mật khẩu trả 202 với cùng thông báo dù email có tồn tại hay không.

Danh sách luôn dùng cấu trúc phân trang, kể cả rỗng:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

Lịch trống là một tài nguyên tổng hợp theo ngày, không ép vào cấu trúc danh sách phân trang.

### 5.2. Idempotency và realtime

- Bắt buộc `Idempotency-Key` (UUID) cho tạo booking online/tại quầy và xác nhận hoàn thủ công. Khóa theo user + route + key, lưu hash request và kết quả tối thiểu 24 giờ; request đang xử lý trả 409 REQUEST_IN_PROGRESS.
- Webhook dùng (provider, transactionId), không dùng key do trình duyệt cấp. Webhook tuân theo body/status acknowledgement nhà cung cấp, là ngoại lệ có tài liệu riêng so với API JSON nội bộ.
- Sự kiện lịch công khai chỉ gồm courtId, khoảng giờ và trạng thái khả dụng; không lộ userId, tiền, email, bookingCode hoặc mã check-in.
- Thanh toán, thông báo và kèo riêng cần kiểm tra quyền khi subscribe; sự kiện gửi sau commit, có eventId để bỏ trùng. Sau reconnect frontend tải lại dữ liệu.

### 5.3. Tích hợp frontend (đề xuất, cần duyệt cùng Q01–Q12)

Các điểm dưới đây mục 5–6 chưa chốt nhưng frontend cần ngay từ tuần 1. Frontend đã dựng theo đề xuất này; đổi thì báo TV1.

| Mã | Đề xuất | Lý do |
|---|---|---|
| Q13 | Deploy frontend và backend **cùng origin** (reverse proxy: `/` → frontend, `/api`, `/oauth2`, `/login/oauth2`, `/ws` → backend). Khi dev, Vite proxy làm việc tương tự | Cookie refresh HttpOnly dùng được với `SameSite=Lax/Strict`, không cần CORS có credentials |
| Q14 | Sau Google OAuth2 thành công, backend đặt cookie refresh rồi redirect về `/oauth2/callback` của frontend (không đưa token lên URL). Frontend gọi `POST /auth/refresh` để lấy access token | Mục 6 chưa nói frontend nhận phiên thế nào sau OAuth2; token trên URL dễ lộ qua log/lịch sử |
| Q15 | Endpoint STOMP là WebSocket thuần tại `/ws` (không SockJS). Access token gửi qua header `Authorization` của frame CONNECT | Frontend dùng `@stomp/stompjs`; trình duyệt không gắn được header vào handshake WebSocket |
| Q16 | Destination: lịch công khai `/topic/courts/{courtId}/availability/{date}`; sự kiện riêng qua user destination `/user/queue/bookings`, `/user/queue/notifications` | Sự kiện riêng không cần topic chứa ID đoán được; Spring tự định tuyến theo phiên đã xác thực |
| Q17 | `GET /users/me` trả `id, fullName, email, emailVerified, avatarUrl, roles` | Header, route guard và điều kiện UC09 (email đã xác thực) cần các trường này ngay khi tải trang |
| Q18 | `GET /venues` hỗ trợ thêm `featured=true` và sort allowlist `ratingAverage`, `minPricePerHour`, `distance` (khi có `lat,lng`) | F10 cần sân nổi bật; F11 cần sắp theo khoảng cách, giá, điểm |

## 6. Danh mục endpoint cơ sở

Endpoint dưới đây là tên chốt đề xuất; trường chi tiết của từng module được bổ sung vào OpenAPI theo quy ước DTO ở mục 7.

| Module | Method và path | Quyền/mục đích |
|---|---|---|
| auth | POST `/auth/register`, `/auth/email-verifications`, `/auth/email-verification-requests` | Đăng ký, xác thực token, gửi lại link |
| auth | POST `/auth/login`, `/auth/refresh`, `/auth/logout` | Đăng nhập, xoay refresh, kết thúc phiên |
| auth | POST `/auth/password-reset-requests`, `/auth/password-resets` | Yêu cầu link/đặt lại mật khẩu |
| auth | GET `/oauth2/authorization/google`; GET `/login/oauth2/code/google` | Ngoại lệ ngoài `/api/v1`, route OAuth2; kiểm tra state và chỉ redirect vào allowlist |
| user | GET/PATCH `/users/me`; POST `/users/me/password-changes` | Hồ sơ mình/đổi mật khẩu |
| owner application | POST `/owner-applications`; GET `/owner-applications/me` | PLAYER nộp/xem hồ sơ |
| search | GET `/venues`, `/venues/{id}`, `/venues/{id}/reviews` | Công khai, chỉ dữ liệu được phép hiển thị |
| booking | GET `/courts/{id}/availability?date=2026-10-01` | Công khai, không lộ người đặt |
| booking | POST `/booking-quotes` | Báo giá; không giữ chỗ |
| booking | POST `/bookings`; GET `/bookings?group=upcoming`; GET `/bookings/{id}` | PLAYER; danh sách và chi tiết chỉ của mình |
| booking | POST `/bookings/{id}/cancellations` | Chủ đơn; điều kiện R05/Q09 |
| payment | POST `/bookings/{id}/payment-requests`; GET `/bookings/{id}/payments` | Chủ đơn; sinh/lấy hướng dẫn thanh toán không gia hạn HOLD |
| payment | POST `/payments/sepay/webhook` | Xác thực riêng nhà cung cấp, không đòi JWT người chơi |
| notification | GET `/notifications`; PATCH `/notifications/{id}` | Người nhận; PATCH chỉ `read: true` |
| review | POST `/bookings/{id}/reviews`; PATCH `/reviews/{id}` | Chủ đơn/tác giả theo R06 |
| owner venue | GET/POST `/owner/venues`; GET/PATCH `/owner/venues/{id}` | OWNER đúng cơ sở |
| owner court | GET/POST `/owner/venues/{id}/courts`; PATCH `/owner/courts/{id}` | OWNER đúng cơ sở |
| owner price | GET/POST `/owner/courts/{id}/price-rules`; PATCH/DELETE `/owner/price-rules/{id}` | OWNER; validate xung đột giá |
| owner booking | GET `/owner/bookings`; POST `/owner/bookings` | Lịch theo khoảng ngày; tạo CASH qua lõi TV2 |
| owner booking | POST `/owner/bookings/{id}/check-ins`, `/owner/bookings/{id}/no-shows` | OWNER; chuyển nghiệp vụ có điều kiện |
| owner block | POST `/owner/courts/{id}/blocks`; DELETE `/owner/blocks/{id}` | OWNER; không ghi đè đơn hợp lệ |
| stats | GET `/owner/statistics?from=...&to=...` | OWNER; khoảng ngày theo múi giờ nghiệp vụ |
| upload | POST `/uploads` | Đăng nhập; multipart; kiểm tra loại, kích thước, quyền sử dụng |
| admin | GET `/admin/owner-applications`; POST `/admin/owner-applications/{id}/decisions` | ADMIN; APPROVED/REJECTED, reason |
| admin | GET `/admin/users`; POST `/admin/users/{id}/locks`; DELETE `/admin/users/{id}/locks` | ADMIN; có audit |

Nhóm lịch sử `upcoming`: HOLD còn hạn hoặc PAID chưa kết thúc; `played`: COMPLETED/NO_SHOW; `cancelled`: CANCELLED/REFUNDED/EXPIRED. Bộ lọc trạng thái cụ thể vẫn được hỗ trợ để phân biệt đã chơi và không đến.

Nhánh nên có: `/matches`, `/matches/{id}/join-requests`, `/matches/{id}/join-requests/{requestId}/decisions`; `/users/me/favorite-venues/{venueId}` (PUT/DELETE); `/complaints`; `/owner/refunds` và `/admin/refunds`; VNPay Return/IPN. Chỉ thêm vào hợp đồng triển khai khi bắt đầu chức năng; không giả lập endpoint chưa tồn tại.

## 7. Quy ước DTO

- Request: `<Action><Resource>Request`; response: `<Resource>Response` hoặc `<Resource>SummaryResponse`.
- Tách DTO tạo/sửa/chi tiết/tóm tắt; không dùng Entity làm request hoặc trả Entity trực tiếp.
- DTO public không chứa passwordHash, refresh token hash, giấy tờ chủ sân, payload webhook thô hoặc quan hệ entity nội bộ.
- Request thông thường không nhận userId/ownerId, roles, bookingStatus, paidAmount, totalAmount. Backend lấy danh tính từ phiên và tính nghiệp vụ.
- Đề xuất từ chối field không khai báo ở request nội bộ bằng 400; parser webhook cần linh hoạt với field mới của nhà cung cấp.
- Validate kiểu/độ dài/range tại DTO; kiểm tra quyền, trạng thái và chống trùng tại service/database. PATCH phải phân biệt absent/null.
- Collection response dùng [] khi rỗng; object tùy chọn dùng null; không tùy tiện lúc có lúc thiếu field đã công bố.
- Giới hạn đề xuất: họ tên 2–100, mật khẩu 8–72 byte UTF-8 khi dùng BCrypt (không cắt ngầm), ghi chú ≤1000 ký tự, nội dung đánh giá ≤2000; email trim/chuẩn hóa theo chính sách thống nhất; số điện thoại chuẩn hóa quốc tế.
- Upload đề xuất: ảnh JPEG/PNG/WebP, ≤5 MiB/file, kiểm tra nội dung thực; giấy tờ gắn quyền riêng tư, không dùng URL công khai. Không ghi password/token vào log validation.

### 7.1. DTO tạo đơn

```json
{
  "courtId": "3a487c86-f5bf-4fc8-b276-2cf3ae3d7801",
  "startAt": "2026-10-01T18:00:00+07:00",
  "endAt": "2026-10-01T19:00:00+07:00",
  "note": ""
}
```

`CreateBookingRequest`: courtId UUID bắt buộc, startAt/endAt có offset bắt buộc, note tùy chọn. Không gửi tổng tiền. `BookingQuoteRequest` dùng cùng các lựa chọn sân/thời gian; không tạo đơn.

```json
{
  "id": "a3c8ab5a-f62e-4b61-b8f6-7489fd49e25f",
  "bookingCode": "DS7K9M2Q",
  "courtId": "3a487c86-f5bf-4fc8-b276-2cf3ae3d7801",
  "status": "HOLD",
  "startAt": "2026-10-01T11:00:00Z",
  "endAt": "2026-10-01T12:00:00Z",
  "totalAmount": 120000,
  "currency": "VND",
  "createdAt": "2026-09-28T16:10:00Z",
  "expiresAt": "2026-09-28T16:15:00Z",
  "refund": null
}
```

Giá 120000 chỉ là ví dụ. `BookingResponse` của người chơi không chứa thông tin riêng của khách khác.

### 7.2. Các hợp đồng request/response cần thống nhất sớm

| DTO | Trường chính và điều kiện |
|---|---|
| RegisterRequest | fullName, email, phone, password; không roles |
| LoginRequest | email, password |
| TokenResponse | accessToken, tokenType=`Bearer`, expiresIn=900; refresh token trong cookie theo Q ở mục 5 |
| ResetPasswordRequest | token, newPassword; token một lần, hạn 15 phút |
| UpdateProfileRequest | avatarUploadId, phone, area, preferredSports, skillLevel; không email/roles/status |
| OwnerApplicationRequest | businessName, address, phone, documentUploadIds; file thuộc người nộp |
| OwnerApplicationDecisionRequest | decision=APPROVED/REJECTED, reason bắt buộc khi từ chối |
| CancelBookingRequest | reason ≤500; không refundAmount |
| CreateReviewRequest | rating 1–5, content, imageUploadIds tối đa 5; bookingId lấy từ path |
| CreateCounterBookingRequest | courtId, startAt, endAt, customerName, customerPhone, cashReceived=true; không giá do client tự quyết |
| CheckInResponse | bookingId, checkedInAt, checkedInBy; không đổi PAID thành trạng thái mới |
| PageResponse<T> | items, page, size, totalElements, totalPages |

## 8. Định dạng lỗi thống nhất

Giữ ba trường code/message/timestamp từ kế hoạch; bổ sung path, traceId và errors. Tất cả API nội bộ trả `application/json`; errors luôn là mảng. Không trả HTML lỗi hoặc HTTP 200 cho thất bại.

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Dữ liệu gửi lên không hợp lệ.",
  "timestamp": "2026-09-28T16:10:00Z",
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

Frontend rẽ nhánh theo `code`, không so sánh chuỗi `message`. Lỗi không theo field có `errors: []`. Không đưa giá trị mật khẩu/token hoặc stack trace vào lỗi; path không chứa query token. traceId do server cấp để tra log.

| HTTP | code ví dụ | Trường hợp |
|---|---|---|
| 400 | INVALID_JSON, VALIDATION_FAILED, INVALID_QUERY_PARAMETER | Sai JSON, sai kiểu, thiếu field, phân trang ngoài giới hạn |
| 401 | AUTHENTICATION_REQUIRED, INVALID_CREDENTIALS, TOKEN_EXPIRED, INVALID_TOKEN | Chưa có/không hợp lệ thông tin xác thực; refresh hết hạn |
| 403 | ACCESS_DENIED, EMAIL_NOT_VERIFIED, ACCOUNT_LOCKED | Đã xác thực nhưng không được thực hiện hành động |
| 404 | RESOURCE_NOT_FOUND | Không tồn tại; cũng dùng khi truy cập ID riêng tư của người khác để tránh lộ sự tồn tại |
| 409 | EMAIL_ALREADY_EXISTS, BOOKING_SLOT_TAKEN, HOLD_LIMIT_EXCEEDED | Xung đột tài nguyên hoặc giới hạn HOLD |
| 409 | BOOKING_EXPIRED, BOOKING_INVALID_STATE, BOOKING_CANCELLATION_WINDOW_CLOSED | Đúng cấu trúc nhưng không còn điều kiện nghiệp vụ |
| 409 | REVIEW_ALREADY_EXISTS, REVIEW_EDIT_WINDOW_CLOSED, PRICE_RULE_CONFLICT | Xung đột đánh giá/giá |
| 409 | IDEMPOTENCY_KEY_REUSED, REQUEST_IN_PROGRESS | Retry không đúng hợp đồng hoặc đang xử lý |
| 413 | FILE_TOO_LARGE | Upload quá giới hạn |
| 415 | UNSUPPORTED_MEDIA_TYPE | Loại nội dung không hỗ trợ |
| 429 | RATE_LIMIT_EXCEEDED, LOGIN_TEMPORARILY_LOCKED | Quá tần suất/khóa tạm 15 phút; có Retry-After theo giây |
| 500 | INTERNAL_ERROR | Lỗi chưa dự kiến; thông báo chung, chi tiết chỉ trong log |
| 503 | SERVICE_UNAVAILABLE | Phụ thuộc bắt buộc tạm thời không hoạt động |

Lỗi đăng nhập không tiết lộ email tồn tại; dùng cùng cơ chế phản hồi/throttling cho các email được thử. 403 ACCOUNT_LOCKED dành cho yêu cầu từ phiên đã được nhận diện là bị admin khóa.

`GlobalExceptionHandler` xử lý lỗi MVC/service. TV5 phải cấu hình thêm AuthenticationEntryPoint và AccessDeniedHandler để lỗi ở security filter cũng cùng schema; lỗi rate limit/upload/parsing phải đồng nhất. Webhook và redirect OAuth2 là ngoại lệ có hợp đồng riêng, không ép provider nhận schema trên.

## 9. Tiêu chí nghiệm thu và bàn giao

| Nhóm | Kiểm tra bắt buộc |
|---|---|
| Đặt sân | Biên 60/240 phút, bước 30 phút, đúng 14 ngày, giờ quá khứ, không xuyên ngày |
| Tranh chấp | 100 request cùng slot: chỉ 1 thành công; khoảng chồng một phần cũng bị chặn; online và CASH dùng chung cơ chế |
| Giới hạn HOLD | Gửi song song không tạo quá 2 HOLD còn hiệu lực/user |
| Thanh toán | Đúng/thiếu/thừa/muộn/sai mã; webhook lặp không ghi tiền hai lần; race hết hạn không tái chiếm sân |
| Hủy | Đúng 24 giờ được hủy; dưới 24 giờ bị từ chối; chỉ một refund cho cùng yêu cầu |
| Quyền | Không xem/sửa đơn người khác; OWNER không sửa sân khác; tài khoản khóa không dùng phiên cũ tiếp |
| Đánh giá | Chỉ COMPLETED; một lần/đơn; đúng biên 7 ngày; NO_SHOW không đánh giá |
| API | 400/401/403/404/409/429 cùng schema; Entity/bí mật không lọt response; PATCH null đúng hợp đồng |
| Realtime | Người không có quyền không subscribe dữ liệu riêng; reconnect tải lại đúng trạng thái |
| Tác vụ | Chạy lặp không gửi email/đổi trạng thái nhiều lần; lỗi email không rollback đơn đã trả tiền |

N03 đề xuất đo p95 <500 ms cho API nội bộ thông thường trên staging với bộ dữ liệu demo và tải được ghi lại; loại trừ upload và thời gian cổng thanh toán ngoài hệ thống. N04 đo từ commit tới client nhận sự kiện ≤2 giây trong cùng môi trường. Đây là tiêu chí cần đo, chưa phải kết quả đã đạt.

Dashboard phân biệt: tiền thực nhận, tiền đã hoàn, số tiền cần đối soát cho chủ sân. NO_SHOW vẫn có thể có tiền đã thu; không mặc định doanh thu bằng số đơn COMPLETED. Tỷ lệ lấp đầy dùng phút PAID/COMPLETED/NO_SHOW trên phút mở cửa có thể bán (trừ bảo trì), không tính HOLD tạm thời; tỷ lệ hủy tính đơn CANCELLED/REFUNDED trên tập đơn đã trả tiền trong kỳ theo ngày tạo. Các chỉ số phải ghi rõ bộ lọc thời gian để tránh hiểu nhầm.

### Phân công hoàn thiện hợp đồng trước 04/10

- TV1: OpenAPI tìm kiếm/đánh giá, DTO danh sách sân và filter, thống nhất dữ liệu bản đồ.
- TV2: OpenAPI booking, trạng thái và đồng bộ slot; cung cấp service lõi cho đơn CASH của TV4.
- TV3: hợp đồng payment/refund, xác thực webhook theo tài liệu provider, dữ liệu thông báo; phối hợp TV5 dùng chung dịch vụ gửi email cho auth.
- TV4: sân/giá/admin/dashboard; dùng mô hình hồ sơ OWNER với TV5, dùng lõi booking với TV2, đối soát với TV3.
- TV5: auth/user, lỗi chung/security handlers, DTO conventions; gộp OpenAPI và tổ chức duyệt Q01–Q18. Ghép kèo đặc tả sau nếu vào phạm vi thực hiện.

Checklist duyệt: [ ] phạm vi và ưu tiên; [ ] Q01–Q12; [ ] Q13–Q18 (tích hợp frontend); [ ] use case; [ ] trạng thái booking/payment/refund; [ ] API/DTO/lỗi; [ ] phân công và tiêu chí nghiệm thu. Điền người duyệt/ngày duyệt trong biên bản thực tế; tài liệu này không thay thế sự xác nhận của thành viên.


## 10. Tổ chức package theo module

Chia mã nguồn theo chức năng nghiệp vụ; bên trong mỗi module chia theo trách nhiệm controller, service, repository, entity và dto. Đây là một ứng dụng Spring Boot, một `pom.xml`, một file JAR; không phải các microservice hoặc Maven module riêng.

### 10.1. Cấu trúc tổng thể

Ví dụ sử dụng package gốc `vn.datsan`. Nếu dự án đã chọn package gốc khác, thay tiền tố nhất quán, không cần đổi tên dự án chỉ để giống ví dụ.

> **Khớp với repo hiện tại:** khung đã khởi tạo dùng package gốc `vn.datsan.backend` với lớp `BackendApplication`, và đang nằm ở gốc repo thay vì `backend/`. Khi đọc cây dưới đây, hiểu `vn/datsan/` là `vn/datsan/backend/` và `DatSanApplication` là `BackendApplication`. Frontend (Feature-Sliced Design) được mô tả riêng trong `frontend/README.md`.

```text
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/vn/datsan/
    │   │   ├── DatSanApplication.java
    │   │   ├── common/                 # TV5: hạ tầng dùng chung
    │   │   │   ├── config/
    │   │   │   ├── dto/
    │   │   │   │   ├── PageResponse.java
    │   │   │   │   ├── ApiErrorResponse.java
    │   │   │   │   └── FieldErrorResponse.java
    │   │   │   └── exception/
    │   │   │       └── GlobalExceptionHandler.java
    │   │   ├── auth/                   # TV5: xác thực và bảo mật
    │   │   ├── user/                   # TV5: tài khoản, hồ sơ
    │   │   ├── match/                  # TV5: ghép kèo, khi triển khai
    │   │   ├── search/                 # TV1: tìm kiếm sân
    │   │   ├── review/                 # TV1: đánh giá
    │   │   ├── booking/                # TV2: đặt sân, giữ chỗ, check-in
    │   │   ├── realtime/               # TV2: hạ tầng WebSocket
    │   │   ├── payment/                # TV3: giao dịch, đối soát, hoàn tiền
    │   │   ├── notification/           # TV3: email và thông báo
    │   │   ├── venue/                  # TV4: cụm sân, sân con, giá
    │   │   ├── stats/                  # TV4: thống kê
    │   │   └── admin/                  # TV4: điều phối thao tác quản trị
    │   └── resources/
    │       ├── application.yaml
    │       └── db/migration/
    │           └── V1__init.sql
    └── test/java/vn/datsan/
        ├── auth/
        ├── booking/
        └── payment/
```

Đặt lớp `DatSanApplication` ở package gốc, phía trên các module. Thư mục test phản chiếu package của mã được kiểm thử. Không cần tạo thư mục rỗng cho toàn bộ chức năng chưa làm.

### 10.2. Cấu trúc bên trong một module

```text
booking/
├── controller/
│   ├── BookingController.java
│   └── OwnerBookingController.java
├── service/
│   └── BookingService.java
├── repository/
│   └── BookingRepository.java
├── entity/
│   ├── Booking.java
│   └── BookingStatus.java
├── dto/
│   ├── request/
│   │   ├── CreateBookingRequest.java
│   │   └── CancelBookingRequest.java
│   └── response/
│       └── BookingResponse.java
├── exception/
│   └── BookingSlotTakenException.java
└── scheduler/
    └── BookingScheduler.java
```

| Package | Trách nhiệm | Không đặt ở đây |
|---|---|---|
| controller | Nhận request, kiểm tra cấu trúc DTO, gọi service, trả HTTP response | Tính giá, truy vấn trực tiếp để xử lý nghiệp vụ |
| service | Quy tắc nghiệp vụ, điều phối, transaction, kiểm tra quyền sở hữu | Chi tiết hiển thị giao diện |
| repository | Đọc/ghi và truy vấn database | Quyết định luồng nghiệp vụ từ HTTP request |
| entity | Mô hình lưu trữ, enum trạng thái thuộc module | DTO public hoặc dữ liệu nhập tùy ý từ client |
| dto/request | Class/record mô tả dữ liệu đầu vào của module | DTO của module khác |
| dto/response | Class/record mô tả dữ liệu đầu ra của module | Entity hoặc bí mật nội bộ |
| exception | Lỗi nghiệp vụ riêng của module | Sao chép cấu trúc JSON lỗi chung |
| scheduler | Điểm kích hoạt tác vụ định kỳ, gọi service | Sao chép logic hết hạn/thanh toán của service |

Module đơn giản có thể dùng trực tiếp `dto/`, chưa cần tách request/response. Không bắt buộc tạo mọi lớp/thư mục; không bắt buộc tạo cặp interface `Service` và `ServiceImpl` nếu chỉ có một triển khai và chưa có nhu cầu.

Ví dụ khai báo package:

```java
package vn.datsan.booking.dto.request;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateBookingRequest(
    UUID courtId,
    OffsetDateTime startAt,
    OffsetDateTime endAt,
    String note
) {}
```

Đây chỉ là ví dụ cấu trúc DTO; khi triển khai cần thêm validation theo mục 7. Tạo DTO chưa đồng nghĩa đã có logic tạo đơn hoặc lưu database.

### 10.3. Quyền sở hữu dữ liệu và phối hợp module

| Dữ liệu/nghiệp vụ | Module sở hữu | Module phối hợp |
|---|---|---|
| User, hồ sơ, hồ sơ đăng ký OWNER | user — TV5 | auth xác thực; admin gọi service để duyệt theo hợp đồng chung |
| Token và luồng đăng nhập | auth — TV5 | user cung cấp dữ liệu tài khoản cần thiết |
| Venue, Court, PriceRule, PricingService | venue — TV4 | search đọc/tìm sân; booking lấy giá và thông tin sân |
| Booking, slot, check-in, đơn CASH | booking — TV2 | OWNER API/UI do TV4 phối hợp; vẫn gọi lõi booking |
| Payment, Refund, đối soát | payment — TV3 | booking phối hợp chuyển trạng thái; admin/owner thao tác theo quyền |
| Review | review — TV1 | booking cung cấp điều kiện COMPLETED; venue nhận kết quả tổng hợp |
| Match, yêu cầu tham gia | match — TV5 | booking cung cấp điều kiện đơn; realtime vận chuyển sự kiện |
| Notification, gửi email | notification — TV3 | auth dùng dịch vụ email cho link xác thực/reset; các module gửi thông báo |

- Một entity chỉ có một nơi định nghĩa; không tạo `User` riêng trong auth, booking và payment.
- Giao tiếp nghiệp vụ ưu tiên qua service/hợp đồng nội bộ rõ ràng, không gọi controller của nhau và không để module khác tùy tiện ghi qua repository.
- Đường dẫn `/owner/...` không có nghĩa mọi code phải nằm trong module venue. `OwnerBookingController` có thể nằm trong booking để dùng chung lõi chống trùng.
- Module admin điều phối chức năng quản trị; không sao chép entity User, Payment hoặc Booking vào admin.
- Không truyền DTO HTTP của module A vào sâu trong service module B nếu có thể dùng tham số hoặc kiểu dữ liệu nội bộ nhỏ, rõ nghĩa.
- Tránh phụ thuộc vòng: ví dụ payment gọi nghiệp vụ xác nhận thanh toán của booking, booking không gọi ngược PaymentService để hoàn tiền trong cùng chuỗi; có thể dùng một service điều phối hoặc sự kiện đã thống nhất. Các thay đổi cần nguyên tử phải nằm trong transaction thích hợp; email/realtime sau commit.
- Không đưa nghiệp vụ đặt sân/tính giá/thanh toán vào common. Common chỉ giữ cấu trúc và hạ tầng thực sự được nhiều module sử dụng.

### 10.4. Phân biệt format chung và DTO riêng

1. Cả nhóm chốt format dữ liệu ở mục 5–8: tên trường, kiểu thời gian/tiền, null, phân trang và lỗi.
2. Mỗi thành viên viết hợp đồng request/response module mình trong OpenAPI: trường, kiểu, bắt buộc, ràng buộc và ví dụ.
3. TV5 gộp và rà soát tính nhất quán; nhóm duyệt hợp đồng.
4. Mỗi thành viên tạo class/record DTO trong module của mình theo hợp đồng đã duyệt.
5. TV5 cung cấp các DTO thực sự dùng chung trong `common/dto`: `PageResponse<T>`, `ApiErrorResponse`, `FieldErrorResponse`.

`LoginRequest` thuộc auth; `CreateBookingRequest` thuộc booking; `OwnerApplicationRequest` thuộc user. Chúng không thuộc common chỉ vì nhiều thành viên cần biết cấu trúc. Mục 7.2 là danh sách hợp đồng cần thống nhất sớm, không phải yêu cầu TV5 tạo toàn bộ DTO cho nhóm.

### 10.5. Quy ước khi làm việc song song

- Thành viên chịu trách nhiệm module của mình; thay đổi hợp đồng service/entity mà người khác đang dùng phải trao đổi và cập nhật tài liệu trong cùng PR.
- File Flyway đã chạy trên môi trường dùng chung không sửa lại; thêm migration mới. TV2 điều phối số phiên bản để tránh hai thành viên tạo migration trùng tên.
- Các cấu hình và DTO common do TV5 điều phối; tránh tạo nhiều định dạng lỗi hoặc phân trang riêng.
- Trước khi merge kiểm tra package đúng module, không lộ entity qua API, không nhân bản logic nghiệp vụ và không tạo phụ thuộc vòng.

# Sửa chữ trên giao diện cho đúng giọng nói với khách

**Ngày:** 01/11/2026 · **Người làm:** TV1 · **Nhánh:** `feature/tv1-home-redesign`

## Vì sao sửa

Nhiều câu trên trang chủ đang giải thích hệ thống chạy thế nào, như viết cho người code hoặc giám khảo đọc. Ví dụ: "Hai người bấm cùng lúc thì chỉ một người được", "đơn tự chuyển sang đã thanh toán", "ô giờ đổi màu trên lịch của mọi người". Web này dành cho người đi đặt sân, nên chữ phải nói điều họ nhận được, ngắn và tự nhiên.

**Quy tắc từ nay cho cả nhóm:** chữ trên giao diện nói với khách, không giải thích cơ chế hệ thống, không ghi chú đồ án hay "dữ liệu mẫu". Những thông tin đó để trong `docs/`.

## Câu đã đổi

| Chỗ | Trước | Sau |
| --- | --- | --- |
| Hero | Chọn ô giờ còn trống, giữ chỗ 5 phút rồi quét mã VietQR, khỏi gọi điện hỏi chủ sân. | Cầu lông, pickleball, bóng đá mini khắp Hà Nội. Thấy giờ trống là đặt được ngay, khỏi gọi điện hỏi chủ sân. |
| Lưới giờ ở hero | 4 sân · 80k/giờ, từ 18:00 là 110k/giờ | 80k/giờ, sau 18:00 là 110k |
| Lưới giờ ở hero | Có người đang giữ | Đang được giữ |
| Lưới giờ ở hero | Tối thiểu 60 phút, chọn thêm một ô liền kề | Đặt ít nhất 1 tiếng |
| Lưới giờ ở hero | Chọn một ô trống để bắt đầu | Chọn giờ bạn muốn chơi |
| Nút ở lưới giờ | Giữ chỗ 5 phút | Đặt sân |
| Tiêu đề phần các bước | Từ ô giờ / đến sân | Đặt là / có sân |
| Đoạn mở đầu phần các bước | … Tiền vào là đơn được chốt, và ô giờ đó đổi màu trên lịch của mọi người đang xem. | Không phải nhắn tin chờ chủ sân trả lời. Chuyển khoản xong là sân đã là của bạn. |
| Bước "Chọn giờ" | Lịch của mỗi sân chia thành ô 30 phút và đổi màu ngay khi có người đặt… | Xem sân nào còn trống vào giờ bạn rảnh, chọn chơi từ 1 đến 4 tiếng. |
| Bước "Giữ chỗ" | … Hai người bấm cùng lúc thì chỉ một người được, người kia thấy báo ngay. | Giờ bạn chọn được giữ riêng trong 5 phút, đủ để chuyển khoản. Không lo bị người khác đặt mất. |
| Bước "Chuyển khoản" | … tiền vào là đơn tự chuyển sang "đã thanh toán". | Quét mã QR bằng app ngân hàng, số tiền và nội dung có sẵn. Tiền vào là bạn nhận xác nhận ngay. |
| Bước "Ra sân" | Đọc mã check-in cho chủ sân khi tới nơi. Cần hủy thì hủy trước giờ chơi từ 24 tiếng… | Tới nơi, đọc mã check-in cho chủ sân là vào chơi. Bận đột xuất thì hủy trước 24 tiếng để được hoàn tiền. |
| Trạng thái trong mảnh QR | Chờ tiền vào… | Chờ thanh toán |
| Phần chủ sân | … dùng chung một lịch, nên một ô giờ không bao giờ bị bán hai lần… | Khách đặt online hay gọi điện tới quầy đều vào chung một lịch, hết cảnh trùng sân. Giá giờ vàng, lịch tuần và doanh thu xem ở một chỗ. |
| Hộp thoại đăng ký cơ sở | Hồ sơ được quản trị viên duyệt trước khi lên trang. | Gửi thông tin sân, được duyệt là khách đặt được ngay. |
| Footer, mục "Về DatSan" | Đồ án môn Công nghệ Web. Sân, giá và lịch trong bản demo là dữ liệu mẫu. | Đặt sân cầu lông, pickleball và bóng đá mini ở Hà Nội. |
| Trang đăng nhập | Dòng phụ "Để giữ chỗ, thanh toán và xem lại lịch chơi của bạn." | Bỏ |
| Ảnh ở phần sân nổi bật và trang đăng nhập | Chú thích dưới ảnh ("Một nhà thi đấu cầu lông ở Việt Nam"…) | Bỏ. Dòng ghi nguồn ảnh ở cuối trang chủ vẫn giữ vì giấy phép CC BY-SA bắt buộc |
| Mô tả trang (thẻ meta) | … Giữ chỗ 5 phút, chuyển khoản bằng VietQR. | … Thấy giờ trống là đặt được ngay, khỏi gọi điện hỏi chủ sân. |

## Tài liệu chung đã cập nhật theo

- `frontend/README.md`, mục **Giao diện**: thay danh sách token cũ (`primary` xanh ngọc, `brand-accent` cam) bằng token hiện tại, thêm `Reveal`, quy tắc không emoji/gradient/đổ bóng, và quy tắc viết chữ cho khách.
- `docs/ke-hoach-do-an-dat-san-java.md`, dòng TV1 tuần 1: ghi chú màu và font đã chốt. Wireframe Figma vẫn để mở, chờ nhóm quyết định có cần làm hay không.

## Quyết định về bản đồ (F12)

Giữ **Leaflet + OpenStreetMap** như kế hoạch. Các quán xá, cây xăng in sẵn trên nền bản đồ không sao; chỉ sân đã đăng ký trên DatSan mới tìm được và bấm vào được. Bấm vào một sân thì hiện thông tin ngắn, bấm "Đặt" thì sang trang chi tiết sân. Không có gì thay đổi so với tài liệu chung.

## Kiểm tra

`typecheck`, `lint`, `lint:fsd`, `test:run` đều qua. Bộ kiểm tra giao diện của skill taste: 0 lỗi.

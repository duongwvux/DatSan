Hệ thống đặt sân online 
Một công ty quản lý thể thao mong muốn tạo một liên kết các sân thể thao với người dùng để thu hút và tạo thuận tiện trong việc đặt sân. Công ty cho ra mắt sản phẩm web quản lý các sân thể thao trong khu vực Hà Nội, phục vụ cả các chủ sân và người chơi thể thao. Phạm vi: tất cả các môn thể thao. Có 3 dạng người dùng của hệ thống: chủ sân, khách, thành viên. Khách là những người chỉ truy cập vào trang và không đăng ký. Còn chủ sân và thành viên là những người đăng ký tài khoản tham gia vào hệ thống. Ngoài ra, sẽ có một endpoint riêng dành cho admin để quản lý toàn bộ hệ thống.
Hệ thống có 3 chức năng chính:
- Đặt sân
- Quản lý sân
- Thanh toán
Ở trang web sử dụng, có 4 trang:
- trang chủ: nơi hiển thị toàn bộ các sân đang quảng bá, thông tin tổng quát liên quan đến sân, có thể tuỳ chọn tìm sân. Khi ấn vào một sân sẽ hiển thị thông tin cụ thể của sân như vị trí, thể loại, tên chủ sân, liên hệ, vị trí chính xác của sân trên bản đồ, phần chọn đặt lịch và phản hồi từ thành viên đã từng đặt sân.
- bản đồ: đánh dấu toàn bộ các sân đã đăng ký trong hệ thống
- nổi bật: các thông tin liên quan đến các sân được thông báo (khuyến mãi, lịch bảo trì, ...)
- tài khoản: thông tin người dùng, lịch sử đơn (ánh xạ nhãn theo 10 trạng thái đơn), báo cáo lên hệ thống.
----------------------------------------------Vai trò phân quyền các thành viên:
 - admin sẽ làm nhiệm vụ: duyệt hồ sơ chủ sân, khoá/mở tài khoản, xử lý báo cáo, duyệt thông báo/khuyến mãi, cấu hình hệ thống ...
 - chủ sân, họ sẽ nộp hồ sơ mô tả chi tiết các tiện ích của sân đấu, người quản trị viên sẽ tiến hành xem xét và duyệt hồ sơ cho chủ sân. Nếu thành công, chủ sân sẽ có bảng dashboard tổng hợp lịch sân cập nhật trực tiếp từ hệ thống, đăng ký sân lên hệ thống, đăng ký thông báo. Hiển thị đơn chờ xác nhận, danh sách đen, doanh thu. Mỗi chủ sân chỉ quản lý tối đa 1 địa điểm, có thể khoá lịch và từ chối đơn của thành viên(do vi phạm nguyên tắc sân ...), có thể đặt sân của chính mình hộ cho khách mà không cần thoát ra ngoài. Chủ sân hoàn toàn có thể thoát ra ngoài chế độ để đặt sân khác như thành viên.
 - Khách sẽ bị giới hạn: chỉ xem các thông tin hiển thị bên ngoài, không biết được các cập nhật về trạng thái các giờ đặt, không thể đặt lịch
 - Thành viên: khi đã đăng nhập và lưu thông tin vào hệ thống, thành viên sẽ được trải nghiệm toàn bộ các tiện ích của trang web mà không bị giới hạn như ở khách.
---------------------------------------------Thông tin về hồ sơ đăng ký:
- Họ tên; ngày tháng năm sinh, số định danh cá nhân, ngày cấp CCCD, địa chỉ thường trú, địa chỉ liên hệ, số điện thoại. thông tin tài khoản nhận tiền
- tên hộ kinh doanh, địa chỉ trụ sở, ngành nghề kinh doanh, vốn kinh doanh, số lao, chủ thể thành lập
- tên sân/ cơ sở, loại hình sân, số lượng sân, diện tích mặt bằng , địa chỉ cụ thể nơi đặt sân, thời gian hoạt động, các dịch vụ đính kèm
- đính kèm các ảnh liên quan đến giấy đề nghị đăng ký hộ kinh doanh, Giấy chứng nhận quyền sử dụng đất hoặc hợp đồng thuê mặt bằng, hồ sơ về phòng cháy, chữa cháy theo quy định áp dụng cho cơ sở, Hồ sơ về cơ sở vật chất, trang thiết bị thể thao.
----------------------------------------------Các thông tin khi đăng ký thành viên:
- họ và tên
- giới tính
- ngày tháng năm sinh
- số CCCD, ngày cấp CCCD // bỏ 
- địa chỉ liên hệ
- email, số điện thoại.
các tài khoản không được trùng CCCD hoặc sdt
sau đăng ký mỗi tài khoản tự động sinh một mã tài khoản riêng
-------------------------------------------Chức năng đặt sân:
Khi thành viên tiến hành đặt sân, họ sẽ phải điền thông tin đăng ký tên sân đặt, khung giờ, phương thức thanh toán, các mã giảm giá. Hệ thống sẽ chỉ cho phép chọn các khung giờ thoả mãn với quy định đơn, các mã giảm giá hợp lệ. Qua bước này, thành viên sẽ xem lại tổng hợp thông tin: tên người đặt, các thông tin về sân, tổng tiền. Nếu chưa hài lòng, có thể quay lại để chỉnh sửa thông tin. Thành viên nhấn xác nhận, nếu có các lỗi như khung giờ đã có người đặt, thông báo lỗi sẽ hiển ra, người dùng thể quay về trang chủ hoặc quay lại bước đầu để chỉnh sửa lại thông tin. Nếu thành công, hệ thống sẽ hiển thị mã QR để giữ chỗ cho người dùng thanh toán trong 5 phút. Tuỳ vào phương thức thanh toán, nếu chọn chuyển khoản, thành viên phải chuyển khoản 100% số tiền hoá đơn, còn nếu thanh toán tiền mặt, thành viên chỉ chuyển trước 30% tiền đặt cọc. Thanh toán thành công, thành viên sẽ được xem lại toàn bộ thông tin đơn và chờ đợi xác nhận từ chủ sân(tối đa 24h từ thời điểm thanh toán thành công). Đơn chỉ được xem là thành công hoàn toàn khi có xác nhận của chủ sân về việc thành viên đã đến chơi và thanh toán đủ.
 - nếu đã thanh toán thành công, không thể đổi lịch. Nếu muốn phải tạo đơn khác.
 - chủ sân có thể xác nhận huỷ/từ chối đơn và đền bù cho thành viên vì các lý do sự cố (thời tiết, sự cố , bảo trì)
 - nếu sân đã được thanh toán thành công(chuyển khoản hay đặt cọc) mà thành viên không đến chơi, chủ sân vẫn sẽ nhận toàn bộ số tiền đã nhận mà không cần đền bù.
 - nếu thành viên thuộc danh sách đen thì không được tiến hành đặt tại sân đã đưa mình vào danh sách đen
-------------------------------------------- Sơ đồ máy trạng thái của đơn
- REGISTER: ĐĂNG KÝ THÔNG TIN
- HOLD: GIỮ CHỖ, CHỜ THANH TOÁN
- PAID: ĐÃ THANH TOÁN (tiền chuyển khoản/ tiền cọc), CHƯA ĐƯỢC DUYỆT
- CONFIRMED: CHỦ SÂN DUYỆT
- LOAD_PAYING: GIỮ CHỖ ĐỂ THANH TOÁN NỐT
- EXPIRED: QUÁ THỜI GIAN MÀ CHƯA THANH TOÁN
- CANCELLED: HUỶ, CHỜ HOÀN TIỀN
- REFUNDED: ĐÃ HOÀN TIỀN, HAI BÊN ĐÃ XÁC NHẬN
- NO_SHOW: KHÁCH KHÔNG ĐẾN
- COMPLETED: KHÁCH ĐẾN CHƠI VÀ THANH TOÁN HẾT

--------------------------------------------Chức năng quản lý sân:
 - 1 địa điểm đăng ký có thể có nhiều sân con
 - chủ sân được thêm thông tin sân : tên, địa điểm, giờ hoạt động, môn thể thao, khung giá cho sân
 - chủ sân được thêm mã giảm giá. Sau đó gửi yêu cầu lên quản trị viên duyệt trước khi áp dụng vào hệ thống
 - chủ sân có thể chỉnh sửa giờ trong ngày do lịch bảo trì, sự cố, ...
 - ẩn sân đi nếu không còn sử dụng
 - đăng ký thông báo lên quản trị viên
 - thiết lập danh sách đen các thành viên vi phạm khi đặt(nợ xấu, chưa trả đủ tiền) chính sân đó. Khi đó thành viên có trong danh sách sẽ không thể đặt sân này cho đến khi chủ sân gỡ. Danh sách đen đăng ký các thông tin: tên thành viên nợ, mã số tài khoản, mã số đơn nợ, số tiền nợ, lý do
---------------------------------------------Chức năng thanh toán:
- mỗi đơn chỉ được áp dụng 1 mã giảm giá , mã hợp lệ do thành viên chọn.
- thành viên sẽ có 5p để giữ chỗ (bắt đầu từ thời điểm người dùng xác nhận thông tin đơn đặt), có hiển thị đếm ngược
- thanh toán: tự động đối soát qua cổng ngân hàng.
-  Thời gian giữ chỗ là 5p(có hiện đếm ngược), sau đó chỉ hiển thị thông báo hạn chế giao dịch và hiển thị đếm ngược 1:30s(không hiển lại QR, có tuỳ chọn quay lại hoặc huỷ đơn). Hết thời gian tự động chuyển về trang đăng ký ban đầu và nhả chỗ cho thành viên khác. Nếu tiền vẫn vào sau thời gian trên thì thành viên phải tự liên hệ với chủ sân để hoàn tiền 
- số tiền cọc được trả bằng chuyển khoản, phần tiền còn lại 70% cần được chủ sân xác nhận lại trên hệ thống để hoàn thiện.
- khi đơn đã xác nhận huỷ, chủ sân sẽ liên hệ hoàn tiền với thành viên(tối đa 24h nếu khách huỷ hợp lệ và 6-12h nếu chủ sân huỷ): số tiền hoàn đúng bằng số tiền thành viên đã chuyển khoản. Đơn chỉ được hoàn tiền thành công khi cả chủ sân và thành viên nhấn xác nhận (giả định tất cả đều hoàn thành đúng hạn). Quá thời hạn chuyển cho admin xem xét
- mã giảm giá bao gồm các thông tin: chọn sân giảm giá, thời điểm giảm giá, bao nhiêu phần trăm giảm giá trên tổng giá trị đơn. Mỗi mã chỉ được sử dụng 1 lần, nếu huỷ đơn có mã sẽ không được áp dụng lại nữa
- toàn bộ tiền chảy thẳng về chủ sân, hệ thống chỉ có trách nhiệm ghi nhận đơn đặt và thông báo nộp phí hàng tháng để chủ sân nộp lại cho hệ thống
- hệ thống sẽ ăn hoa hồng trên mỗi đơn NO_SHOW hoặc COMPLETED 30% , mỗi tháng sẽ gửi hoá đơn về cho chủ sân
---------------------------------------------Các yêu cầu về đơn đặt:
- 1 đơn chỉ gắn với một sân con duy nhất trong 1 địa điểm 
- trong 1 ngày bất kỳ, 1 cá nhân chỉ được đặt tối đa 2 đơn đã thanh toán
- đơn vị thời gian là 30p, mỗi đơn tối thiểu 1h, tối đa 4h trong 1 đơn
- yêu cầu đặt sân: tối thiểu 3h và tối đa là 30 ngày trước giờ chơi; yêu cầu huỷ sân: khách huỷ tối thiểu 12h trước giờ chơi, chủ sân huỷ không giới hạn. Nếu quá thời gian thì không được thực hiện các thao tác trên (ngoại lệ với chủ sân)
- Thời gian duyệt đơn tối đa 2h. Nếu hết hạn duyệt đơn, tự động chuyển sang CANCELLED để chuẩn bị hoàn tiền
- tổng thời lượng đặt liên tiếp trên cùng 1 sân không quá 4h trong 1 ngày bất kỳ
- chủ sân đánh dấu COMPLETED/NO_SHOW trong 24h sau giừo kết thúc

----------------------------------------------Phản hồi:
- đơn thành công: người chơi vào gửi đánh giá : 1-5 sao và ghi phản hồi
- báo cáo lên hệ thống: Tên báo cáo, nội dung, bằng chứng đính kèm( file ảnh/ . pdf)
- thông báo từ chủ sân phải được duyệt từ quản trị viên trước khi public cho các thành viên, thời hạn hiển thị trong 3 tháng tính từ lúc đăng bài, thông báo chỉ hiển thị trên trang web 
 - tìm kiếm: lọc theo môn. khu vực, khoảng giá, đánh giá sao

# Thiết kế lại trang chủ và design system

**Ngày:** 31/10/2026 · **Người làm:** TV1 · **Nhánh:** `feature/tv1-home-redesign` (commit `bd9b081`, chưa mở PR)

## Tóm tắt

Trang chủ cũ trông giống mẫu do AI sinh ra: tiêu đề căn giữa, khối màu loang, ba thẻ có icon, emoji, và số liệu bịa ("30s", "24/7"). Bản mới lấy màu từ chính mặt sân, dùng ảnh thật, đặt một lưới giờ bấm thử được ngay ở màn hình đầu, và viết lại chữ cho tự nhiên.

Phần lớn thay đổi nằm ở trang chủ. Một số thay đổi là **toàn app** (màu, font, bo góc, header, footer), nên ai đang làm giao diện nên đọc mục "Ảnh hưởng tới phần của bạn".

## Cách xem

```bash
git fetch
git switch feature/tv1-home-redesign
cd frontend
npm install        # bắt buộc: đã đổi gói font
npm run dev        # http://localhost:5173
```

Bấm nút mặt trăng / mặt trời trên header để xem cả giao diện sáng và tối.

## Trang chủ mới gồm gì

| Phần | Nội dung | Nền |
| --- | --- | --- |
| Hero | Tiêu đề "Xem giờ trống, đặt sân luôn", ô tìm sân, và **lưới giờ bấm thử được**: chọn ô trống thì hiện giờ và tổng tiền | Nền trang + tấm xanh thảm cầu lông |
| Sân nổi bật theo từng môn | Tab Cầu lông / Pickleball / Bóng đá 5 / Bóng đá 7. Mỗi sân là một dải có ảnh, giá, địa chỉ, điểm đánh giá. Ảnh mặt sân đổi theo môn | Xanh sân pickleball |
| Từ ô giờ đến sân | Bốn bước: chọn giờ, giữ chỗ, chuyển khoản, ra sân. Mỗi bước kèm một mảnh giao diện mẫu | Trắng phấn, dải xanh đậm dần sang nhạt |
| Cho thuê sân trên DatSan | Lời mời chủ sân kèm hộp thoại "Đăng ký cơ sở" | Xanh thảm cầu lông |
| Footer | Chữ DatSan ghép từ các khối màu mặt sân, link, ghi chú đồ án | Đen mực |

## Ảnh hưởng tới phần của bạn

Những thay đổi này áp dụng cho **mọi trang**, không chỉ trang chủ:

| Thay đổi | Ảnh hưởng | Ai cần để ý |
| --- | --- | --- |
| Font đổi từ Be Vietnam Pro sang **Bricolage Grotesque** (gói `@fontsource-variable/bricolage-grotesque`, có đủ dấu tiếng Việt) | Chữ toàn app đổi dáng. Nhớ `npm install` | Tất cả |
| `--primary` giờ là **màu mực gần đen** (giao diện tối thì gần trắng), không còn xanh ngọc | Mọi `<Button>` mặc định thành nút đen | Tất cả |
| `--radius` nhỏ lại còn 6px | Input, thẻ, dropdown vuông hơn | Tất cả |
| `--slot-selected` giờ là **vàng chanh** (`--ball`) | Ô giờ đang chọn trên lưới đặt sân | **TV2** |
| Thêm nhóm màu mặt sân: `court-green`, `court-green-deep`, `court-mint`, `court-blue`, `court-blue-tone`, `court-blue-deep`, `turf`, `ball`, `chalk`, `ink-field` | Dùng như class Tailwind: `bg-court-green`, `text-ball`… | Tất cả |
| `container-page` giờ rộng tối đa 1760px với lề 16–32px (trước là 1280px, căn giữa) | Nội dung các trang rộng ra trên màn hình lớn | Tất cả |
| Header không còn bám cố định khi cuộn, bỏ viền và nền mờ | | Tất cả |
| Footer mới (chữ khối màu) hiện ở mọi trang dùng `MainLayout` | | Tất cả |
| `Logo` chỉ còn chữ "DatSan"; `<Logo compact />` là hình sơ đồ sân | Sidebar của dashboard dùng bản rút gọn | **TV4** |
| `SPORTS[x].emoji` đã bị xóa, chỉ còn `label` | Ai đang dùng emoji môn thể thao sẽ lỗi kiểu | Tất cả |
| `VenueSearchBar` có thêm prop `layout="row" \| "stack"` | Mặc định vẫn là `row` | TV1 |
| `VenueCard` bỏ khối màu loang, emoji, nền mờ và hiệu ứng nổi khi rê chuột | | TV1 |
| Trang đăng nhập: bỏ câu trích dẫn bịa, thay bằng ảnh sân thật | | **TV5** |
| Mock có thêm 5 sân mẫu (tổng 10), mỗi môn 3–4 sân | `/venues` hiện 10 kết quả | Tất cả |

Component mới dùng chung: **`Reveal`** (`@/shared/ui`), cho phần tử hiện dần khi cuộn tới. Nó tự tắt khi người dùng bật "giảm chuyển động", và nội dung vẫn hiện nếu script lỗi.

```tsx
<Reveal delay={70}>…</Reveal>                       // hiện dần, nhích lên
<span className="mask-line">
  <Reveal as="span" variant="line">Tiêu đề</Reveal>  // chữ trượt lên từ sau mép
</span>
<Reveal as="figure" variant="picture">…</Reveal>    // ảnh mở như rèm
```

## Quy tắc giao diện từ nay

Rút từ skill thiết kế "taste" mà nhóm dùng để tránh kiểu giao diện do AI sinh ra. Áp dụng cho các trang để đọc (trang chủ, chi tiết sân). Màn hình làm việc (dashboard, bảng, form) được phép dùng viền mảnh và nhãn nhỏ.

- Không emoji, không màu chuyển sắc (gradient), không đổ bóng cho thứ đang nằm yên. Bóng chỉ dùng cho menu và hộp thoại.
- Không dòng chữ nhỏ viết hoa phía trên tiêu đề, không đánh số 01 / 02 / 03.
- Tiêu đề tối đa 2 dòng ở mọi kích thước màn hình.
- Không bịa số liệu, lời khen hay logo khách hàng. Thiếu dữ liệu thật thì dùng dữ liệu mẫu và ghi rõ là mẫu.
- Màu lấy từ token, không viết mã màu cứng trong component (đã có trong `frontend/README.md`).
- Chữ thân bài 16px trở lên, màu mực đậm. Màu xám chỉ dùng cho chú thích.

## Ảnh

Ba ảnh thật từ Wikimedia Commons, lưu trong `frontend/public/images/`. Nguồn được ghi ở cuối trang chủ và trên ảnh của trang đăng nhập.

| File | Ảnh gốc | Tác giả | Giấy phép |
| --- | --- | --- | --- |
| `badminton-hall.jpg` | [BLK 0004](https://commons.wikimedia.org/wiki/File:BLK_0004.jpg) (đã cắt, bỏ băng-rôn và bảng tài trợ) | không ghi | CC0 |
| `pickleball-courts.jpg` | [Pickleball Courts 4-6](https://commons.wikimedia.org/wiki/File:Harry_B._Anderson_Tennis_Center_-_Pickleball_Courts_4-6.jpg) | GA Kevin | CC0 |
| `hanoi-football-pitch.jpg` | [Hanoi - Amsterdam High School football pitch 1](https://commons.wikimedia.org/wiki/File:Hanoi_-_Amsterdam_High_School_football_pitch_1.jpg) | Quenhitran | CC BY-SA 3.0 |

Mock đang dùng lại các ảnh này làm ảnh bìa cho vài sân mẫu. Đó **không phải** ảnh của các sân đó; khi TV4 làm xong upload ảnh thì thay bằng ảnh thật của từng sân.

## Dữ liệu mẫu cần thay sau

- Lưới giờ ở hero: lịch trống và giá (80k/giờ, từ 18:00 là 110k/giờ) là mẫu, sinh cố định theo ngày. Lưới thật là phần F20–F21 của **TV2** (`features/select-time-slots`); mảnh ở trang chủ chỉ để minh họa và nằm riêng trong `pages/home`.
- Nút "Giữ chỗ 5 phút" ở hero dẫn tới trang chi tiết của sân mẫu (hiện là trang tạm).
- Mã đơn `DS7K9M2Q`, mã check-in `482 913` và hình QR trong phần "Từ ô giờ đến sân" là minh họa. QR không quét được.
- Hộp thoại "Đăng ký cơ sở" chỉ chuyển sang `/owner`. Trang nộp hồ sơ chủ sân (F05) chưa có.

## Kiểm tra đã chạy

- `npm run typecheck`, `npm run lint`, `npm run lint:fsd`, `npm run test:run`: đều qua.
- Bộ kiểm tra của skill taste (chụp ở 1440 / 768 / 390px, đo cỡ chữ, lề, khoảng trống, độ tương phản): 0 lỗi, cả trên bản build production. Hai cảnh báo còn lại là không có video và lề phải rộng hơn lề trái ở hai phần dùng cột 7–11.
- Đã xem `/venues`, `/login`, `/owner`, `/admin`, menu tài khoản sau khi đăng nhập, cả giao diện sáng lẫn tối: không vỡ.

## Còn dở dang

- **Chưa mở PR.** Khi mở sẽ trỏ vào `main` (remote chưa có nhánh `dev`) và cần 1 người review.
- `npm install` báo 23 lỗ hổng, phần lớn nằm trong công cụ dev và build, không vào bản chạy cho người dùng. Sẽ chạy `npm audit fix` (không kèm `--force`) trong một commit riêng.
- `npx prettier --check` báo lỗi ở rất nhiều file do máy Windows để `core.autocrlf=true` (file dùng CRLF). Lỗi này có từ trước; các file trong lần này đều đúng format.

## File đã sửa

- **Token và cấu hình:** `frontend/src/app/styles/index.css`, `frontend/index.html`, `frontend/vite.config.ts`, `frontend/package.json`
- **Trang chủ:** `frontend/src/pages/home/ui/` (`home-page`, `hero`, `slot-preview`, `booking-steps`, `owner-cta`)
- **Widget:** `widgets/featured-venues`, `widgets/app-header`, `widgets/app-footer`
- **Dùng chung:** `shared/ui/reveal.tsx` (mới), `shared/ui/logo.tsx`
- **Khác:** `entities/venue` (`sports.ts`, `venue-card.tsx`), `features/search-venues`, `pages/login`, `app/mocks/fixtures.ts`, `public/images/`

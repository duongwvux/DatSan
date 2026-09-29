# DatSan — Frontend

React 19 + Vite + TypeScript, tổ chức theo **[Feature-Sliced Design (FSD)](https://fsd.how)**.

## Chạy dự án

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Mặc định `.env.development` bật **mock API (MSW)** nên chạy được khi backend chưa có endpoint.
Tài khoản demo: `demo@datsan.vn` / `password` (có đủ vai trò PLAYER, OWNER, ADMIN).

Để gọi backend thật, tạo `.env.development.local`:

```bash
VITE_ENABLE_MOCKS=false
VITE_BACKEND_URL=http://localhost:8080
```

Vite proxy chuyển `/api`, `/oauth2`, `/login/oauth2`, `/ws` sang backend, nên frontend và backend
chạy **cùng origin** khi dev: cookie refresh HttpOnly hoạt động, không cần cấu hình CORS.

| Lệnh                        | Mục đích                                                      |
| --------------------------- | ------------------------------------------------------------- |
| `npm run dev`               | Chạy dev server                                               |
| `npm run build`             | Type check + build production (kèm PWA service worker)        |
| `npm run lint`              | Oxlint                                                        |
| `npm run lint:fsd`          | Steiger — kiểm tra quy tắc FSD (import sai tầng, public API…) |
| `npm run typecheck`         | Chỉ kiểm tra kiểu                                             |
| `npm run test` / `test:run` | Vitest (watch / chạy một lần)                                 |
| `npm run format`            | Prettier (tự sắp xếp class Tailwind)                          |

Trước khi mở PR: `npm run typecheck && npm run lint && npm run lint:fsd && npm run test:run`.

## Công nghệ

| Mảng             | Thư viện                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------- |
| UI               | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, sonner (toast), next-themes (sáng/tối) |
| Routing          | React Router (lazy-load theo trang)                                                      |
| Dữ liệu server   | TanStack Query + Axios                                                                   |
| State client     | Zustand (chỉ cho state thật sự toàn cục, ví dụ phiên đăng nhập)                          |
| Form             | react-hook-form + zod                                                                    |
| Realtime         | @stomp/stompjs (Spring WebSocket STOMP)                                                  |
| Bản đồ / biểu đồ | react-leaflet + OpenStreetMap, Recharts                                                  |
| Mock / test      | MSW, Vitest, Testing Library                                                             |
| PWA              | vite-plugin-pwa                                                                          |

## Cấu trúc FSD

```text
src/
├── app/         # Khởi động ứng dụng: entrypoint, providers, router, layout, style, mock API
├── pages/       # Một trang = một slice. Ghép widgets/features/entities, gần như không có logic
├── widgets/     # Khối UI lớn, tự đủ: header, footer, danh sách sân nổi bật, khung dashboard
├── features/    # Hành động người dùng mang giá trị nghiệp vụ: đăng nhập, tìm sân, đổi theme…
├── entities/    # Thực thể nghiệp vụ: session, venue, booking… (type, API, UI hiển thị)
└── shared/      # Không biết gì về nghiệp vụ: ui kit, http client, config, lib, realtime
```

### Ba quy tắc bắt buộc

1. **Chỉ import từ tầng thấp hơn**: `app → pages → widgets → features → entities → shared`.
   Feature không import feature khác; entity không import entity khác (cần thì dùng `@x`, xem docs FSD).
2. **Chỉ import qua public API** (`index.ts` của slice):
   `import { VenueCard } from '@/entities/venue'` ✅ — `from '@/entities/venue/ui/venue-card'` ❌.
3. **Segment đặt theo mục đích**: `ui/`, `api/`, `model/`, `lib/`, `config/` — không đặt `components/`, `hooks/`, `types/`.

`npm run lint:fsd` (Steiger) bắt các lỗi trên tự động.

### Slice hiện có và nơi mỗi người làm

| Tầng     | Slice                                                            | Người phụ trách tiếp                              |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| entities | `session`                                                        | TV5                                               |
| entities | `venue`                                                          | TV1 (tìm kiếm), TV4 (quản lý)                     |
| entities | `booking`                                                        | TV2                                               |
| entities | _thêm:_ `payment`, `notification`                                | TV3                                               |
| entities | _thêm:_ `review`                                                 | TV1                                               |
| entities | _thêm:_ `court`, `price-rule`                                    | TV4                                               |
| features | `auth/login`, `auth/logout`                                      | TV5 (thêm `auth/register`, `auth/reset-password`) |
| features | `search-venues`, `toggle-theme`                                  | TV1                                               |
| features | _thêm:_ `select-time-slots`, `create-booking`, `cancel-booking`  | TV2                                               |
| features | _thêm:_ `pay-by-qr`                                              | TV3                                               |
| widgets  | `app-header`, `app-footer`, `featured-venues`, `dashboard-shell` | TV1                                               |
| pages    | `home`, `venues`, `login`, `not-found`                           | TV1 / TV5                                         |
| pages    | `placeholders` — trang tạm, xóa dần khi làm trang thật           | Mọi người                                         |

Ví dụ thêm một feature:

```text
src/features/cancel-booking/
├── api/cancel-booking.ts      # gọi POST /bookings/{id}/cancellations
├── model/use-cancel-booking.ts
├── ui/cancel-booking-button.tsx
└── index.ts                   # export { CancelBookingButton } from './ui/cancel-booking-button'
```

## Quy ước

- **Gọi API**: dùng `http` từ `@/shared/api`. Mỗi entity có `xxxApi` (hàm gọi) và `xxxQueries` (query key + queryOptions)
  để các nơi dùng chung key khi invalidate.
- **Lỗi**: interceptor chuyển mọi lỗi thành `ApiError`. Rẽ nhánh theo `error.code` (ví dụ `BOOKING_SLOT_TAKEN`),
  **không** so sánh `message` — đúng hợp đồng ở `docs/use-case-api.md` mục 8.
- **Xác thực**: access token chỉ giữ trong bộ nhớ; 401 tự gọi `/auth/refresh` một lần rồi thử lại request.
  Route guard ở frontend chỉ để trải nghiệm, backend vẫn phải kiểm tra quyền.
- **Tiền và thời gian**: tiền là số nguyên VND, hiển thị bằng `formatVnd`. Thời gian từ API là UTC,
  hiển thị theo `Asia/Ho_Chi_Minh` bằng các hàm trong `@/shared/lib`.
- **Realtime**: `subscribeTopic()` từ `@/shared/realtime`; sau khi reconnect phải refetch qua REST
  (`onRealtimeReconnect`).
- **Đường dẫn**: dùng `routes` từ `@/shared/config`, không viết cứng URL.
- **Giao diện**: màu, bo góc, font lấy từ design tokens ở `src/app/styles/index.css`
  (`primary`, `brand-accent`, `slot-*` cho lưới giờ…). Không dùng mã màu cứng trong component.
  Thêm component shadcn: `npx shadcn@latest add <tên>` (tự vào `src/shared/ui`), rồi export ở `shared/ui/index.ts`.
- **Mock API**: thêm handler cho module của mình trong `src/app/mocks/`, bám đúng DTO trong OpenAPI.
  Khi backend có endpoint thật, tắt mock bằng `.env.development.local`.

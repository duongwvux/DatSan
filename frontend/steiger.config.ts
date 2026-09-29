import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Giai đoạn khung dự án: nhiều slice mới có một nơi dùng. Bật lại (warn) từ tuần 3 khi đã có đủ trang.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
])

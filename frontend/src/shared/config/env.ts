/** Biến môi trường đã kiểm tra kiểu. Chỉ biến có tiền tố VITE_ mới vào được bundle. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL ?? '/ws',
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
  isDev: import.meta.env.DEV,
} as const

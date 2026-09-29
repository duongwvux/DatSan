/**
 * Access token chỉ giữ trong bộ nhớ (không localStorage) để giảm rủi ro XSS.
 * Refresh token nằm trong cookie HttpOnly do backend quản lý (use-case-api.md mục 5).
 */
let accessToken: string | null = null

export const accessTokenStore = {
  get: () => accessToken,
  set(token: string | null) {
    accessToken = token
  },
}

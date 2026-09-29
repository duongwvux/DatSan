import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config'
import { accessTokenStore } from './access-token'
import { toApiError } from './api-error'

export interface TokenResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

/** Axios instance dùng chung cho mọi API nội bộ `/api/v1`. */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true, // gửi cookie refresh token
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = accessTokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Gộp nhiều request 401 đồng thời vào một lần refresh duy nhất. */
let refreshPromise: Promise<string | null> | null = null

export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= axios
    .post<TokenResponse>(`${env.apiBaseUrl}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      accessTokenStore.set(data.accessToken)
      return data.accessToken
    })
    .catch(() => {
      accessTokenStore.set(null)
      return null
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register']

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const shouldRefresh =
      error.response?.status === 401 &&
      config !== undefined &&
      !config._retried &&
      !NO_REFRESH_PATHS.some((path) => config.url?.includes(path))

    if (shouldRefresh) {
      config._retried = true
      const token = await refreshAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        return http(config)
      }
    }

    return Promise.reject(toApiError(error))
  },
)

/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Chỉ bật service worker ở bản build; dev dùng MSW nên tắt để tránh xung đột.
        devOptions: { enabled: false },
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'DatSan — Đặt sân thể thao',
          short_name: 'DatSan',
          description: 'Tìm và đặt sân cầu lông, pickleball, bóng đá gần bạn.',
          lang: 'vi',
          theme_color: '#0f766e',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//, /^\/oauth2\//, /^\/login\/oauth2\//, /^\/ws/],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    server: {
      port: 5173,
      // Proxy cùng origin: cookie refresh HttpOnly hoạt động mà không cần CORS/SameSite=None khi dev.
      proxy: {
        '/api': { target: backendUrl, changeOrigin: true },
        '/oauth2': { target: backendUrl, changeOrigin: true },
        '/login/oauth2': { target: backendUrl, changeOrigin: true },
        '/ws': { target: backendUrl, changeOrigin: true, ws: true },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/shared/config/test-setup.ts'],
      css: false,
    },
  }
})

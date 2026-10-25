import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyApiPlugin } from './vite-plugin-verify-api.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Required so Electron can load built files via file://
  base: './',
  // HTTPS so phones treat the page as a secure context and show the GPS prompt
  plugins: [react(), tailwindcss(), basicSsl(), verifyApiPlugin()],
  server: {
    // Listen on LAN so a phone can open the QR verify URL
    host: true,
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})


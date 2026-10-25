import { execFileSync } from 'node:child_process'
import { X509Certificate } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, type ServerOptions } from 'vite'
import { verifyApiPlugin } from './vite-plugin-verify-api.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function lanIpv4s(): string[] {
  const ips: string[] = []
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      const isV4 = entry.family === 'IPv4' || entry.family === 4
      if (isV4 && !entry.internal) ips.push(entry.address)
    }
  }
  return ips
}

/** Self-signed cert whose IP SANs match the QR host (192.168.x.x), not only localhost. */
function lanHttps(): ServerOptions['https'] {
  const ips = lanIpv4s()
  const dir = path.join(rootDir, 'node_modules/.vite/lan-ssl')
  const certPath = path.join(dir, 'cert.pem')
  const keyPath = path.join(dir, 'key.pem')
  const covers = () => {
    try {
      const san = new X509Certificate(fs.readFileSync(certPath)).subjectAltName ?? ''
      return (
        san.includes('DNS:localhost') &&
        ips.every((ip) => san.includes(`IP Address:${ip}`))
      )
    } catch {
      return false
    }
  }
  if (!covers()) {
    fs.mkdirSync(dir, { recursive: true })
    const san = ['DNS:localhost', 'IP:127.0.0.1', ...ips.map((ip) => `IP:${ip}`)].join(',')
    try {
      execFileSync(
        'openssl',
        [
          'req',
          '-x509',
          '-newkey',
          'rsa:2048',
          '-keyout',
          keyPath,
          '-out',
          certPath,
          '-days',
          '30',
          '-nodes',
          '-subj',
          '/CN=gearsight-dev',
          '-addext',
          `subjectAltName=${san}`,
        ],
        { stdio: 'ignore' },
      )
    } catch {
      return undefined
    }
  }
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) return undefined
  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  }
}

const https = lanHttps()

export default defineConfig({
  // Required so Electron can load built files via file://
  base: './',
  // HTTPS so phones treat the page as a secure context and show the GPS prompt.
  // basicSsl only covers localhost; prefer a cert that includes the LAN address.
  plugins: [react(), tailwindcss(), ...(https ? [] : [basicSsl()]), verifyApiPlugin()],
  server: {
    // Listen on LAN so a phone can open the QR verify URL
    host: true,
    port: 5173,
    strictPort: true,
    https,
    // detect/.venv is ~3.5GB / 28k files. Watching it stalls the dev server
    // and full-reloads the page whenever a Python package file changes.
    watch: {
      ignored: ['**/detect/**'],
    },
    warmup: {
      clientFiles: ['./src/main.tsx', './src/pages/verify/PhoneVerifyPage.tsx'],
    },
    // HTTPS app → local RT-DETR service (avoids mixed content)
    proxy: {
      '/api/detect': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})

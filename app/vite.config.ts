import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const version = fs.readFileSync('version.txt', 'utf8').trim()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost', // Local API (or host.docker.internal if running in container dev mode, but here default to local)
        changeOrigin: true,
      }
    }
  }
})

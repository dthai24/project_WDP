import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@/foo' → 'src/foo' — tránh relative import hell khi refactor
      '@': path.resolve(__dirname, './src'),
    },
  },
})

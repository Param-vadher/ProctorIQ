/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import obfuscatorPlugin from 'rollup-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts']
  } as any,
  build: {
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    react(),
    obfuscatorPlugin(),
  ],
})

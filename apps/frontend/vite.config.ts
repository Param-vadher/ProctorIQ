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
    // Scrambles the frontend code during the production build
    obfuscatorPlugin({
      global: false,
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        // Heavily deters "Inspect Element" by triggering an infinite debugger loop
        debugProtection: true,
        debugProtectionInterval: 2000,
        // Disables console logs
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      }
    })
  ],
})

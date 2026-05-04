// https://nextjs.org/docs/app/guides/testing/vitest
// https://vitest.dev/guide/coverage.html

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      provider: 'v8',
    },
    environment: 'jsdom',
    include: [
      './app/**/*.test.{ts,tsx}',
      './components/**/*.test.{ts,tsx}',
      './lib/**/*.test.{ts,tsx}',
    ],
  },
})

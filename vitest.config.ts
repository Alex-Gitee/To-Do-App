import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/e2e/**', // Playwright's tests live here, not Vitest's
    ],
  },
});
import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false, // tasks share one DB file; parallel runs would race each other
  use: {
    baseURL: 'http://localhost:3100',
  },
  webServer: {
    command: 'npm run dev -- --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    env: {
      DB_PATH: path.join(process.cwd(), 'data', 'e2e-test.sqlite'),
    },
  },
});
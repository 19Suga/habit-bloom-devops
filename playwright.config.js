import { defineConfig } from '@playwright/test';

const useExternalServers = process.env.PLAYWRIGHT_EXTERNAL_SERVERS === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5190',
    trace: 'retain-on-failure'
  },
  webServer: useExternalServers ? undefined : [
    {
      command: 'node e2e/start-backend.js',
      url: 'http://127.0.0.1:3101/api/health',
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      timeout: 120000
    },
    {
      command: 'node e2e/start-frontend.js',
      url: 'http://127.0.0.1:5190',
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      timeout: 120000
    }
  ]
});

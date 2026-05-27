import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: '../../dist/playwright/console-e2e-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: '../../dist/playwright/console-e2e-report' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://console-staging.qovery.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: '../../dist/playwright/console-e2e',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

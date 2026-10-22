import { type Page, expect, test } from '@playwright/test'
import { openEnvironment } from './utils/staging-navigation'

const E2E_AUTH_TOKEN_STORAGE_KEY = 'qovery-e2e-auth-token'

const requiredEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const injectAuthToken = async (page: Page) => {
  const authToken = requiredEnv('E2E_AUTH_TOKEN')

  await page.addInitScript(
    ({ key, token }) => {
      window.localStorage.setItem(key, token)
    },
    { key: E2E_AUTH_TOKEN_STORAGE_KEY, token: authToken }
  )
}

test('staging user can reach an environment', async ({ page }) => {
  await injectAuthToken(page)
  await page.goto('/')

  await expect(page).toHaveURL(/\/organization\/[^/]+\/overview/)

  await openEnvironment(page, requiredEnv('E2E_PROJECT_ID'), requiredEnv('E2E_ENVIRONMENT_ID'))
})

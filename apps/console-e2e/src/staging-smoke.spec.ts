import { type Page, expect, test } from '@playwright/test'

const requiredEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const clickByName = async (page: Page, name: string) => {
  await page
    .getByRole('link', { name, exact: true })
    .or(page.getByRole('button', { name, exact: true }))
    .first()
    .click()
}

const login = async (page: Page) => {
  const email = requiredEnv('E2E_USER_EMAIL')
  const password = requiredEnv('E2E_USER_PASSWORD')
  const loginMethod = process.env.E2E_LOGIN_METHOD ?? 'github'

  await page.goto('/')

  if (loginMethod === 'saml') {
    await page.getByRole('button', { name: /continue with saml sso/i }).click()
    await page.getByLabel(/company domain/i).fill(requiredEnv('E2E_SSO_DOMAIN'))
    await page.getByRole('button', { name: /connect/i }).click()
  } else {
    await page.getByRole('button', { name: new RegExp(`continue with ${loginMethod}`, 'i') }).click()
  }

  await page.getByLabel(/email/i).fill(email)

  const continueButton = page.getByRole('button', { name: /continue|next/i })
  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click()
  }

  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /log in|sign in|continue/i }).click()
}

test('staging user can reach a service overview', async ({ page }) => {
  await login(page)

  await expect(page).toHaveURL(/\/organization\/[^/]+\/overview/)

  await clickByName(page, requiredEnv('E2E_PROJECT_NAME'))
  await expect(page).toHaveURL(/\/project\/[^/]+\/overview/)

  await clickByName(page, requiredEnv('E2E_ENVIRONMENT_NAME'))
  await expect(page).toHaveURL(/\/environment\/[^/]+/)

  await clickByName(page, requiredEnv('E2E_SERVICE_NAME'))
  await expect(page).toHaveURL(/\/service\/[^/]+\/overview/)
})

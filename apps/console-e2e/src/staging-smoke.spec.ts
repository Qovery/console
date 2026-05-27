import { type Page, expect, test } from '@playwright/test'

const E2E_AUTH_TOKEN_STORAGE_KEY = 'qovery-e2e-auth-token'

const requiredEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const clickByNameOrHref = async (page: Page, nameOrId: string, hrefPart: string) => {
  const namedTarget = page
    .getByRole('link', { name: nameOrId, exact: true })
    .or(page.getByRole('button', { name: nameOrId, exact: true }))
    .first()

  if (await namedTarget.isVisible().catch(() => false)) {
    await namedTarget.click()
    return
  }

  await page.locator(`a[href*="${hrefPart}"]`).first().click()
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

  const projectId = requiredEnv('E2E_PROJECT_ID')
  await clickByNameOrHref(page, projectId, `/project/${projectId}/`)
  await expect(page).toHaveURL(/\/project\/[^/]+\/overview/)

  const environmentId = requiredEnv('E2E_ENVIRONMENT_ID')
  await clickByNameOrHref(page, environmentId, `/environment/${environmentId}`)
  await expect(page).toHaveURL(/\/environment\/[^/]+/)
})

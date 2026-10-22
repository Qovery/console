import { type Page, expect } from '@playwright/test'

export async function openEnvironment(page: Page, projectId: string, environmentId: string) {
  const organizationPath = new URL(page.url()).pathname.replace(/\/overview\/?$/, '')
  const projectPath = `${organizationPath}/project/${projectId}/overview`
  const environmentPath = `${organizationPath}/project/${projectId}/environment/${environmentId}/overview`
  const environmentUrl = new URL(environmentPath, page.url()).href
  const projectUrl = new URL(projectPath, page.url()).href

  await page.locator(`a[href="${projectPath}"], a[href="${environmentPath}"]`).first().click()
  await expect(page).toHaveURL((url) => url.href === projectUrl || url.href === environmentUrl)

  if (page.url() === projectUrl) {
    await page.locator(`a[href="${environmentPath}"]`).first().click()
  }

  await expect(page).toHaveURL(environmentUrl)
}

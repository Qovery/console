import { expect, test } from '@playwright/test'
import { openEnvironment } from './utils/staging-navigation'

const origin = 'http://console.test'
const organizationPath = '/organization/org-1'
const projectPath = `${organizationPath}/project/project-1/overview`
const environmentPath = `${organizationPath}/project/project-1/environment/env-1/overview`

test('reaches the exact environment through the project, ignoring nested and similarly named links', async ({
  page,
}) => {
  await page.route(`${origin}/**`, (route) => {
    const path = new URL(route.request().url()).pathname
    return route.fulfill({
      contentType: 'text/html',
      body:
        path === `${organizationPath}/overview`
          ? `<a href="${organizationPath}/project/project-1/environment/other/overview">Other environment</a>
           <a href="${organizationPath}/project/project-10/overview">Other project</a>
           <a href="${projectPath}">Project</a>`
          : `<a href="${environmentPath}-other">Other environment</a><a href="${environmentPath}">Environment</a>`,
    })
  })
  await page.goto(`${origin}${organizationPath}/overview`)
  await openEnvironment(page, 'project-1', 'env-1')
  await expect(page).toHaveURL(`${origin}${environmentPath}`)
})

test('accepts the onboarding shortcut directly to the expected environment', async ({ page }) => {
  await page.route(`${origin}/**`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<a href="${organizationPath}/project/project-1/environment/other/overview">Other environment</a>
           <a href="${environmentPath}">Go to my environment</a>`,
    })
  )
  await page.goto(`${origin}${organizationPath}/overview`)
  await openEnvironment(page, 'project-1', 'env-1')
  await expect(page).toHaveURL(`${origin}${environmentPath}`)
})

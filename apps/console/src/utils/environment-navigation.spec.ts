import { getEnvironmentTabs } from './environment-navigation'

it('places Automation second after Overview with a New badge', () => {
  const tabs = getEnvironmentTabs(true)
  expect(tabs.map(({ id }) => id)).toEqual(['overview', 'automation', 'deployments', 'variables', 'settings'])
  expect(tabs[1]).toEqual(
    expect.objectContaining({
      label: 'Automation',
      isNew: true,
      routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation',
    })
  )
})

it('hides Automation when Agent Tasks are disabled', () => {
  expect(getEnvironmentTabs(false).map(({ id }) => id)).toEqual(['overview', 'deployments', 'variables', 'settings'])
})

it('filters the declared context tabs without replacing them with defaults', () => {
  const tabs = [{ id: 'custom', label: 'Custom', iconName: 'timer' as const, routeId: '/custom' }]
  expect(getEnvironmentTabs(false, tabs)).toEqual(tabs)
})

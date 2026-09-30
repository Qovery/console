import { type IconName } from '@fortawesome/fontawesome-common-types'

export interface EnvironmentNavigationTab {
  id: string
  label: string
  iconName: IconName
  routeId: string
  isNew?: boolean
}

export const ENVIRONMENT_TABS: EnvironmentNavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
  },
  {
    id: 'automation',
    label: 'Automations',
    isNew: true,
    iconName: 'clock-nine',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    iconName: 'rocket',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployments',
  },
  {
    id: 'variables',
    label: 'Variables',
    iconName: 'key',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear-complex',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings',
  },
]

export function getEnvironmentTabs(agentTasksEnabled: boolean, tabs: EnvironmentNavigationTab[] = ENVIRONMENT_TABS) {
  return tabs.filter((tab) => agentTasksEnabled || tab.id !== 'automation')
}

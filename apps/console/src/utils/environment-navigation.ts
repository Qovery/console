import { type IconName } from '@fortawesome/fontawesome-common-types'

export interface EnvironmentNavigationTab {
  id: string
  label: string
  iconName: IconName
  routeId: string
  isNew?: boolean
}

const ENVIRONMENT_TABS: EnvironmentNavigationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'table-layout',
    routeId: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
  },
  {
    id: 'automation',
    label: 'Automation',
    isNew: true,
    iconName: 'timer',
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

export function getEnvironmentTabs(agentTasksEnabled: boolean) {
  return ENVIRONMENT_TABS.filter((tab) => agentTasksEnabled || tab.id !== 'automation')
}

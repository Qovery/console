import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useMatchRoute } from '@tanstack/react-router'
import {
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  CLUSTER_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENT_LOGS_URL,
  INFRA_LOGS_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import useServiceType from '../use-service-type/use-service-type'

export type QuickAction = { label: string; iconName: IconName; link: string }

const toTanstackPath = (path: string): string => path.replace(/:([A-Za-z0-9_]+)/g, '$$1')

export function useQuickActions(): QuickAction[] {
  // TODO: testing-only - migrate to TanStack Router hooks for console-v5.
  const matchRoute = useMatchRoute()

  const applicationMatch = matchRoute({ to: toTanstackPath(APPLICATION_URL()), fuzzy: true })
  const databaseMatch = matchRoute({ to: toTanstackPath(DATABASE_URL()), fuzzy: true })
  const projectMatch = matchRoute({ to: toTanstackPath(ENVIRONMENTS_URL()), fuzzy: true })
  const environmentMatch = matchRoute({ to: toTanstackPath(SERVICES_URL()), fuzzy: true })
  const clusterMatch = matchRoute({ to: toTanstackPath(CLUSTER_URL()), fuzzy: true })

  const serviceId = applicationMatch?.applicationId ?? databaseMatch?.databaseId

  const { data: serviceType } = useServiceType({
    serviceId,
    environmentId: applicationMatch?.environmentId ?? databaseMatch?.environmentId,
  })

  if (applicationMatch && serviceId) {
    const { organizationId, projectId, environmentId } = applicationMatch
    return [
      {
        label: 'See deployment logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_VERSION_URL(serviceId),
      },
      {
        label: 'See live logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId),
      },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          targetId: serviceId,
          targetType: serviceType,
          projectId,
          environmentId,
        }),
      },
    ]
  }

  if (databaseMatch && serviceId) {
    const { organizationId, projectId, environmentId } = databaseMatch
    return [
      {
        label: 'See deployment logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_VERSION_URL(serviceId),
      },
      {
        label: 'See live logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId),
      },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          targetId: serviceId,
          targetType: serviceType,
          projectId,
          environmentId,
        }),
      },
    ]
  }

  if (environmentMatch) {
    const { organizationId, projectId, environmentId } = environmentMatch
    return [
      {
        label: 'See logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId),
      },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          projectId,
          targetId: environmentId,
          targetType: 'ENVIRONMENT',
        }),
      },
    ]
  }

  if (projectMatch) {
    const { organizationId, projectId } = projectMatch
    return [
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          projectId,
          targetId: projectId,
          targetType: 'PROJECT',
        }),
      },
    ]
  }

  if (clusterMatch) {
    const { organizationId, clusterId } = clusterMatch
    return [
      { label: 'See logs', iconName: 'scroll', link: INFRA_LOGS_URL(organizationId, clusterId) },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          targetType: 'CLUSTER',
          targetId: clusterId,
        }),
      },
    ]
  }

  return []
}

export default useQuickActions

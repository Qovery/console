import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useLocation, useParams } from '@tanstack/react-router'
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

const createPathRegex = (pattern: string): RegExp => {
  const escapedPattern = pattern.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')
  const withParams = escapedPattern.replace(/:([A-Za-z0-9_]+)/g, '[^/]+')
  return new RegExp(`^${withParams}(?:/.*)?$`)
}

export function useQuickActions(): QuickAction[] {
  // TODO: testing-only - migrate to TanStack Router hooks for console-v5.
  const { pathname } = useLocation()
  const {
    organizationId,
    projectId,
    environmentId,
    applicationId,
    databaseId,
    clusterId,
  }: {
    organizationId?: string
    projectId?: string
    environmentId?: string
    applicationId?: string
    databaseId?: string
    clusterId?: string
  } = useParams({ strict: false })

  const applicationMatch = createPathRegex(APPLICATION_URL()).test(pathname)
  const databaseMatch = createPathRegex(DATABASE_URL()).test(pathname)
  const projectMatch = createPathRegex(ENVIRONMENTS_URL()).test(pathname)
  const environmentMatch = createPathRegex(SERVICES_URL()).test(pathname)
  const clusterMatch = createPathRegex(CLUSTER_URL()).test(pathname)

  const serviceId = applicationMatch ? applicationId : databaseMatch ? databaseId : undefined

  const { data: serviceType } = useServiceType({
    serviceId,
    environmentId: applicationMatch || databaseMatch ? environmentId : undefined,
  })

  if (applicationMatch && serviceId && organizationId && projectId && environmentId) {
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

  if (databaseMatch && serviceId && organizationId && projectId && environmentId) {
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

  if (environmentMatch && organizationId && projectId && environmentId) {
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

  if (projectMatch && organizationId && projectId) {
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

  if (clusterMatch && organizationId && clusterId) {
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

import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useMatchRoute } from '@tanstack/react-router'
import {
  AUDIT_LOGS_PARAMS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  INFRA_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import useServiceType from '../use-service-type/use-service-type'

export type QuickAction = { label: string; iconName: IconName; link: string }

export function useQuickActions(): QuickAction[] {
  const matchRoute = useMatchRoute()

  const serviceMatch = matchRoute({
    to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId',
    fuzzy: true,
  })
  const projectMatch = matchRoute({
    to: '/organization/$organizationId/project/$projectId',
    fuzzy: true,
  })
  const environmentMatch = matchRoute({
    to: '/organization/$organizationId/project/$projectId/environment/$environmentId',
    fuzzy: true,
  })
  const clusterMatch = matchRoute({
    to: '/organization/$organizationId/cluster/$clusterId',
    fuzzy: true,
  })
  const serviceParams = serviceMatch || undefined

  const { data: serviceType } = useServiceType({
    serviceId: serviceParams?.serviceId,
    environmentId: serviceParams?.environmentId,
  })

  if (serviceMatch) {
    const { organizationId, projectId, environmentId, serviceId } = serviceMatch
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

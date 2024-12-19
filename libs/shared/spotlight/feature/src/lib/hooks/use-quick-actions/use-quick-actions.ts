import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useMatch } from 'react-router-dom'
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

export function useQuickActions(): QuickAction[] {
  const applicationMatch = useMatch({ path: APPLICATION_URL(), end: false })
  const databaseMatch = useMatch({ path: DATABASE_URL(), end: false })
  const projectMatch = useMatch({ path: ENVIRONMENTS_URL(), end: false })
  const environmentMatch = useMatch({ path: SERVICES_URL(), end: false })
  const clusterMatch = useMatch({ path: CLUSTER_URL(), end: false })

  const serviceId = applicationMatch?.params['applicationId'] ?? databaseMatch?.params['databaseId']

  const { data: serviceType } = useServiceType({
    serviceId,
    environmentId: applicationMatch?.params['environmentId'] ?? databaseMatch?.params['environmentId'],
  })

  if (applicationMatch && serviceId) {
    const { organizationId, projectId, environmentId } = applicationMatch.params
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
    const { organizationId, projectId, environmentId } = databaseMatch.params
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
    const { organizationId, projectId, environmentId } = environmentMatch.params
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
    const { organizationId, projectId } = projectMatch.params
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
    const { organizationId, clusterId } = clusterMatch.params
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

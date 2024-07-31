import { type ServiceMetricsDto } from 'qovery-ws-typescript-axios'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queries } from '@qovery/state/util-queries'

export interface UseMetricsWebSocketProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
  serviceType: Omit<ServiceType, 'LIFECYCLE_JOB' | 'CRON_JOB'>
}

export function useMetricsWebSocket({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  serviceType,
}: UseMetricsWebSocketProps) {
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/metrics',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      service_type: serviceType.toString(),
    },
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      Boolean(serviceType),
    onMessage(queryClient, message: Array<ServiceMetricsDto>) {
      queryClient.setQueryData(queries.services.metrics(environmentId, serviceId).queryKey, () => message)
    },
    onError(queryClient) {
      if (environmentId && serviceId) {
        queryClient.setQueryData(queries.services.metrics(environmentId, serviceId).queryKey, () => null)
      }
    },
  })
}

export default useMetricsWebSocket

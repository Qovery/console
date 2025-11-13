import { useQuery } from '@tanstack/react-query'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'

export interface UseServiceDeploymentIdProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

export function useServiceDeploymentId({ clusterId, serviceId, enabled = false }: UseServiceDeploymentIdProps) {
  return useQuery({
    ...serviceLogs.serviceLabel({
      path: 'qovery_com_deployment_id',
      clusterId,
      serviceId,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && enabled,
  })
}

export default useServiceDeploymentId

import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  serviceId: string
  serviceType?: ServiceType
  pageSize?: number
  suspense?: boolean
}

export function useDeploymentHistory({
  serviceId,
  serviceType,
  pageSize = 100,
  suspense = false,
}: UseDeploymentHistoryProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentHistory({ serviceId, serviceType: serviceType!!, pageSize }),
    enabled: Boolean(serviceId) && Boolean(serviceType),
    suspense,
    refetchInterval: 5000,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
  })
}

export default useDeploymentHistory

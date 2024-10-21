import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  serviceId?: string
  serviceType?: ServiceType
}

export function useDeploymentHistory({ serviceId, serviceType }: UseDeploymentHistoryProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentHistory({ serviceId: serviceId!!, serviceType: serviceType!! }),
    enabled: Boolean(serviceId) && Boolean(serviceType),
    refetchInterval: 5000,
  })
}

export default useDeploymentHistory

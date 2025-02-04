import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentQueueProps {
  serviceId: string
  serviceType?: ServiceType
}

export function useDeploymentQueue({ serviceId, serviceType }: UseDeploymentQueueProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentQueue({ serviceId, serviceType: serviceType!! }),
    refetchInterval: 5000,
    retryOnMount: true,
    notifyOnChangeProps: ['data'],
  })
}

export default useDeploymentQueue

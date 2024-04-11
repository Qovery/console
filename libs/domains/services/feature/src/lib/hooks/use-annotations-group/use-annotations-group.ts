import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export type UseAnnotationsGroupProps = {
  serviceId?: string
  serviceType?: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'JOB' | 'DATABASE'>
}

export function useAnnotationsGroup({ serviceId, serviceType }: UseAnnotationsGroupProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.annotationsGroup({ serviceId: serviceId!!, serviceType: serviceType!! }),
    enabled: Boolean(serviceId) && Boolean(serviceType),
  })
}

export default useAnnotationsGroup

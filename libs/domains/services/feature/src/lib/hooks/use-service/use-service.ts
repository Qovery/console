import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import { useServiceType } from '../use-service-type/use-service-type'

export interface UseServiceProps {
  environmentId?: string
  serviceId?: string
}

export function useService({ environmentId, serviceId }: UseServiceProps) {
  const { data: serviceType } = useServiceType({ environmentId, serviceId })
  return useQuery({
    ...queries.services.details({ serviceId: serviceId!, serviceType: serviceType! }),
    enabled: Boolean(serviceId) && Boolean(serviceType),
  })
}

export default useService

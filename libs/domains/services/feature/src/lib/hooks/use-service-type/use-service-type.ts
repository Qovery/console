import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServiceTypeProps {
  environmentId?: string
  serviceId?: string
}

export function useServiceType({ environmentId, serviceId }: UseServiceTypeProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    select(data) {
      return data.find(({ id }) => id === serviceId)?.serviceType
    },
    enabled: Boolean(environmentId),
    retry: 3,
  })
}

export default useServiceType

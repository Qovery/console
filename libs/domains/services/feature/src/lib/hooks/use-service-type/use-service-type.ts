import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServiceTypeProps {
  environmentId?: string
  serviceId?: string
  suspense?: boolean
}

export function useServiceType({ environmentId, serviceId, suspense = false }: UseServiceTypeProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    suspense,
    select(data) {
      return data.find(({ id }) => id === serviceId)?.serviceType
    },
    enabled: Boolean(environmentId),
  })
}

export default useServiceType

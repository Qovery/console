import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServiceTypeProps {
  environmentId?: string
  serviceId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useServiceType({ environmentId, serviceId, enabled = false, suspense = false }: UseServiceTypeProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    select(data) {
      return data.find(({ id }) => id === serviceId)?.serviceType
    },
    enabled: Boolean(environmentId) && enabled,
    suspense,
  })
}

export default useServiceType

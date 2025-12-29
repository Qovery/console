import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesSearchProps {
  organizationId: string
  clusterId: string
}

export function useServicesSearch({ organizationId, clusterId }: UseServicesSearchProps) {
  return useQuery({
    ...queries.observability.servicesSearch({ organizationId, clusterId }),
  })
}

export default useServicesSearch

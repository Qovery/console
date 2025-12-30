import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesSearchProps {
  organizationId: string
  clusterIds: string[]
}

export function useServicesSearch({ organizationId, clusterIds }: UseServicesSearchProps) {
  return useQuery({
    ...queries.organizations.servicesSearch({ organizationId }),
    select: (data) =>
      data?.filter(
        (service) =>
          clusterIds.includes(service.cluster_id) &&
          (service.service_type === 'APPLICATION' || service.service_type === 'CONTAINER')
      ),
  })
}

export default useServicesSearch

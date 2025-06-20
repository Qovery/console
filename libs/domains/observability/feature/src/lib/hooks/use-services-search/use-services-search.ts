import { useQuery } from '@tanstack/react-query'
import { OrganizationMainCallsApi } from 'qovery-typescript-axios'

interface UseServicesSearchProps {
  organizationId: string
  clusterId: string
}

const organizationApi = new OrganizationMainCallsApi()

export function useServicesSearch({ organizationId, clusterId }: UseServicesSearchProps) {
  return useQuery({
    queryKey: ['services-search', organizationId, clusterId],
    queryFn: async () => {
      const response = await organizationApi.listServicesByOrganizationId(
        organizationId,
        undefined,
        undefined,
        clusterId
      )
      return response.data.results
    },
  })
}

export default useServicesSearch

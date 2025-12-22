import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesSearchProps {
  organizationId: string
}

export function useServicesSearch({ organizationId }: UseServicesSearchProps) {
  return useQuery({
    ...queries.organizations.servicesSearch({ organizationId }),
  })
}

export default useServicesSearch

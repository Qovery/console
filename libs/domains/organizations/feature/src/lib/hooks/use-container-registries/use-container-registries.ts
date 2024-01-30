import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerRegistriesProps {
  organizationId: string
}

export function useContainerRegistries({ organizationId }: UseContainerRegistriesProps) {
  return useQuery({
    ...queries.organizations.containerRegistries({ organizationId }),
  })
}

export default useContainerRegistries

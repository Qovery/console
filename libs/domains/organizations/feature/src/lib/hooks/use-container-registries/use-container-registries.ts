import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseContainerRegistriesProps {
  organizationId: string
  suspense?: boolean
}

export function useContainerRegistries({ organizationId, suspense = false }: UseContainerRegistriesProps) {
  return useQuery({
    ...queries.organizations.containerRegistries({ organizationId }),
    suspense,
  })
}

export default useContainerRegistries

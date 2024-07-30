import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoryAssociatedServicesProps {
  organizationId: string
  helmRepositoryId: string
}

export function useHelmRepositoryAssociatedServices({
  organizationId,
  helmRepositoryId,
}: UseHelmRepositoryAssociatedServicesProps) {
  return useQuery({
    ...queries.organizations.helmRepositoryAssociatedServices({ organizationId, helmRepositoryId }),
  })
}

export default useHelmRepositoryAssociatedServices

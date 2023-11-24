import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoryProps {
  organizationId: string
  helmRepositoryId?: string
}

export function useHelmRepository({ organizationId, helmRepositoryId }: UseHelmRepositoryProps) {
  return useQuery({
    ...queries.organizations.helmRepository({ organizationId, helmRepositoryId: helmRepositoryId! }),
    enabled: !!helmRepositoryId,
  })
}

export default useHelmRepository

import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoriesProps {
  organizationId: string
}

export function useHelmRepositories({ organizationId }: UseHelmRepositoriesProps) {
  return useQuery({
    ...queries.organizations.helmRepositories({ organizationId }),
  })
}

export default useHelmRepositories

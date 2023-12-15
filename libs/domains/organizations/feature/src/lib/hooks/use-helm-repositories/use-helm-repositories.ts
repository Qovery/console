import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoriesProps {
  organizationId: string
  enabled?: boolean
}

export function useHelmRepositories({ organizationId, enabled }: UseHelmRepositoriesProps) {
  return useQuery({
    ...queries.organizations.helmRepositories({ organizationId }),
    select(data) {
      return data?.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
  })
}

export default useHelmRepositories

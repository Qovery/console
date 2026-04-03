import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoriesProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useHelmRepositories({ organizationId, enabled, suspense = false }: UseHelmRepositoriesProps) {
  return useQuery({
    ...queries.organizations.helmRepositories({ organizationId }),
    select(data) {
      return data?.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
    suspense,
  })
}

export default useHelmRepositories

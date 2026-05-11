import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseApiTokensProps {
  organizationId: string
  suspense?: boolean
}

export function useApiTokens({ organizationId, suspense = false }: UseApiTokensProps) {
  return useQuery({
    ...queries.organizations.apiTokens({ organizationId }),
    suspense,
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
    },
  })
}

export default useApiTokens

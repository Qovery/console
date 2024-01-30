import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseApiTokensProps {
  organizationId: string
}

export function useApiTokens({ organizationId }: UseApiTokensProps) {
  return useQuery({
    ...queries.organizations.apiTokens({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
    },
  })
}

export default useApiTokens

import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UsePolicyApiTokensProps {
  organizationId: string
  suspense?: boolean
}

export function usePolicyApiTokens({ organizationId, suspense = false }: UsePolicyApiTokensProps) {
  return useQuery({
    ...queries.organizations.policyApiTokens({ organizationId }),
    suspense,
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
    },
  })
}

export default usePolicyApiTokens

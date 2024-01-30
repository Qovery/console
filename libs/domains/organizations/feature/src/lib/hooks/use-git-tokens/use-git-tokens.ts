import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokensProps {
  organizationId: string
  enabled?: boolean
}

export function useGitTokens({ organizationId, enabled }: UseGitTokensProps) {
  return useQuery({
    ...queries.organizations.gitTokens({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
    refetchOnWindowFocus: false,
  })
}

export default useGitTokens

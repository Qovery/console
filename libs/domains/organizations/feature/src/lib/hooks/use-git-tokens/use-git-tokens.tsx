import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokensProps {
  organizationId: string
  enabled?: boolean
}

export function useGitTokens({ organizationId, enabled }: UseGitTokensProps) {
  return useQuery({
    ...queries.organizations.gitTokens(organizationId),
    enabled: enabled,
    refetchOnWindowFocus: false,
  })
}

export default useGitTokens

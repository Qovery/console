import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokensProps {
  organizationId: string
}

export function useGitTokens({ organizationId }: UseGitTokensProps) {
  return useQuery({
    ...queries.organizations.gitTokens(organizationId),
  })
}

export default useGitTokens

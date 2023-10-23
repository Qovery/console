import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokensProps {
  organizationId: string
}

export function useGitTokens({ organizationId }: UseGitTokensProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.organizations.gitTokens(organizationId),
  })
}

export default useGitTokens

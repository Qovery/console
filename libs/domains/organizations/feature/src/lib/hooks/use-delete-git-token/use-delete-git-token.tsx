import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeleteGitTokenProps {
  organizationId: string
  gitTokenId: string
}

export function useDeleteGitToken({ organizationId, gitTokenId }: UseDeleteGitTokenProps) {
  return useQuery({
    ...queries.organizations.deleteGitToken({ organizationId, gitTokenId }),
  })
}

export default useDeleteGitToken

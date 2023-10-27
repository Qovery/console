import { useQuery } from '@tanstack/react-query'
import { type GitTokenRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseEditGitTokenProps {
  organizationId: string
  gitTokenId: string
  gitTokenRequest: GitTokenRequest
}

export function useEditGitToken({ organizationId, gitTokenId, gitTokenRequest }: UseEditGitTokenProps) {
  return useQuery({
    ...queries.organizations.editGitToken({ organizationId, gitTokenId, gitTokenRequest }),
  })
}

export default useEditGitToken

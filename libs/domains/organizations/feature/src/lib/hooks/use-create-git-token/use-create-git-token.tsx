import { useQuery } from '@tanstack/react-query'
import { type GitTokenRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateGitTokenProps {
  organizationId: string
  gitTokenRequest: GitTokenRequest
}

export function useCreateGitToken({ organizationId, gitTokenRequest }: UseCreateGitTokenProps) {
  return useQuery({
    ...queries.organizations.createGitToken({ organizationId, gitTokenRequest }),
  })
}

export default useCreateGitToken

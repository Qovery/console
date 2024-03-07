import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokenAssociatedServicesProps {
  organizationId: string
  gitTokenId: string
}

export function useGitTokenAssociatedServices({ organizationId, gitTokenId }: UseGitTokenAssociatedServicesProps) {
  return useQuery({
    ...queries.organizations.gitTokenAssociatedServices({ organizationId, gitTokenId }),
  })
}

export default useGitTokenAssociatedServices

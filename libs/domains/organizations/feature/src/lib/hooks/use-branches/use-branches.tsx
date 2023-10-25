import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseBranchesProps {
  organizationId: string
  gitProvider: string
  name: string
  gitToken?: string
  enabled?: boolean
}

export function useBranches({ organizationId, gitProvider, name, gitToken, enabled }: UseBranchesProps) {
  return useQuery({
    ...queries.organizations.branches(organizationId, gitProvider, name, gitToken),
    enabled: enabled,
    meta: {
      notifyOnError: true,
    },
    refetchOnWindowFocus: false,
  })
}

export default useBranches

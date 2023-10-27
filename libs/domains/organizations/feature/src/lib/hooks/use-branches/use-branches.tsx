import { useQuery } from '@tanstack/react-query'
import { type GitProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseBranchesProps {
  organizationId: string
  gitProvider: GitProviderEnum
  name: string
  gitToken?: string
  enabled?: boolean
}

export function useBranches({ organizationId, gitProvider, name, gitToken, enabled }: UseBranchesProps) {
  return useQuery({
    ...queries.organizations.branches({ organizationId, gitProvider, name, gitToken }),
    enabled,
    meta: {
      notifyOnError: true,
    },
    refetchOnWindowFocus: false,
  })
}

export default useBranches

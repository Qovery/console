import { useQuery } from '@tanstack/react-query'
import { type GitProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseRepositoriesProps {
  organizationId: string
  gitProvider: GitProviderEnum
  gitToken?: string
  enabled?: boolean
  suspense?: boolean
}

export function useRepositories({ organizationId, gitProvider, enabled, gitToken, suspense }: UseRepositoriesProps) {
  return useQuery({
    ...queries.organizations.repositories({ organizationId, gitProvider, gitToken }),
    meta: {
      notifyOnError: true,
    },
    enabled,
    suspense,
    refetchOnWindowFocus: false,
  })
}

export default useRepositories

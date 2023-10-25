import { useQuery } from '@tanstack/react-query'
import { type GitProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseRepositoriesProps {
  organizationId: string
  gitProvider: GitProviderEnum
  gitToken?: string
}

export function useRepositories({ organizationId, gitProvider, gitToken }: UseRepositoriesProps) {
  return useQuery({
    ...queries.organizations.repositories({ organizationId, gitProvider, gitToken }),
    // enabled: Boolean(gitProvider) || Boolean(gitToken),
  })
}

export default useRepositories

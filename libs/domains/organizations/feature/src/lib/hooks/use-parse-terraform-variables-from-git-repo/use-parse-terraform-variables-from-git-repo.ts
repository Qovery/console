import { useQuery } from '@tanstack/react-query'
import { type ApplicationGitRepositoryRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseParseTerraformVariablesFromGitRepoProps {
  organizationId: string
  repository: ApplicationGitRepositoryRequest
  enabled?: boolean
}

export function useParseTerraformVariablesFromGitRepo({
  organizationId,
  repository,
  enabled = true,
}: UseParseTerraformVariablesFromGitRepoProps) {
  return useQuery({
    ...queries.organizations.parseTerraformVariablesFromGitRepo({ organizationId, repository }),
    enabled,
    meta: {
      notifyOnError: true,
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}

export default useParseTerraformVariablesFromGitRepo

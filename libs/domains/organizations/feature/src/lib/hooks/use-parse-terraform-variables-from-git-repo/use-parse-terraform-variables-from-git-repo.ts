import { useQuery } from '@tanstack/react-query'
import { type ApplicationGitRepositoryRequest } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseParseTerraformVariablesFromGitRepoProps {
  organizationId: string
  repository: ApplicationGitRepositoryRequest
  enabled?: boolean
  suspense?: boolean
}

export function useParseTerraformVariablesFromGitRepo({
  organizationId,
  repository,
  enabled = true,
  suspense = false,
}: UseParseTerraformVariablesFromGitRepoProps) {
  return useQuery({
    ...queries.organizations.parseTerraformVariablesFromGitRepo({ organizationId, repository }),
    enabled,
    meta: {
      notifyOnError: true,
    },
    refetchOnWindowFocus: false,
    suspense,
    staleTime: 0,
  })
}

export default useParseTerraformVariablesFromGitRepo

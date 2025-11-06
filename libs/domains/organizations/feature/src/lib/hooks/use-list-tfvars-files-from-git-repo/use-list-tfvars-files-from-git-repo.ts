import { useQuery } from '@tanstack/react-query'
import { type ApplicationGitRepositoryRequest, type TfVarsDiscoveryMode } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseListTfVarsFilesFromGitRepoProps {
  organizationId: string
  repository: ApplicationGitRepositoryRequest
  mode: TfVarsDiscoveryMode
  enabled?: boolean
}

export function useListTfVarsFilesFromGitRepo({
  organizationId,
  repository,
  mode,
  enabled = true,
}: UseListTfVarsFilesFromGitRepoProps) {
  return useQuery({
    ...queries.organizations.listTfVarsFilesFromGitRepo({ organizationId, repository, mode }),
    enabled,
    meta: {
      notifyOnError: false,
    },
    refetchOnWindowFocus: false,
    retry: false,
  })
}

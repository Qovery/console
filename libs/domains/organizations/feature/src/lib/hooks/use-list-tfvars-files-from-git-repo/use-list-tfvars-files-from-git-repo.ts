import { useMutation } from '@tanstack/react-query'
import { type ApplicationGitRepositoryRequest, type TfVarsDiscoveryMode } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'

export interface UseListTfVarsFilesFromGitRepoProps {
  organizationId: string
  repository: ApplicationGitRepositoryRequest
  mode: TfVarsDiscoveryMode
}

export function useListTfVarsFilesFromGitRepo() {
  return useMutation(mutations.listTfVarsFilesFromGitRepo, {
    meta: {
      notifyOnSuccess: false,
      notifyOnError: false,
    },
  })
}

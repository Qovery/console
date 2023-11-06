import { type ApplicationGitRepository, type Commit } from 'qovery-typescript-axios'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { useCommits } from '../use-commits/use-commits'

export interface UseLastDeployedCommitProps {
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
}

export function useLastDeployedCommit({ gitRepository, serviceId, serviceType }: UseLastDeployedCommitProps) {
  const { data: commits, ...props } = useCommits({ serviceId, serviceType })

  const delta = commits?.findIndex(({ git_commit_id }) => git_commit_id === gitRepository.deployed_commit_id) ?? 0
  const defaultCommitInfo: Commit = {
    created_at: gitRepository.deployed_commit_date ?? 'unknown',
    git_commit_id: gitRepository.deployed_commit_id ?? 'unknown',
    tag: gitRepository.deployed_commit_tag ?? 'unknown',
    message: 'unknown',
    author_name: gitRepository.deployed_commit_contributor ?? 'unknown',
  }
  return {
    data: {
      deployedCommit: commits?.[delta] ?? defaultCommitInfo,
      delta,
    },
    ...props,
  }
}

export default useLastDeployedCommit

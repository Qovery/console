import { type ApplicationGitRepository, type Commit } from 'qovery-typescript-axios'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { type UseCommitsProps, useCommits } from '../use-commits/use-commits'

export type UseLastDeployedCommitProps = {
  serviceId: string
  serviceType: ServiceType
  gitRepository?: ApplicationGitRepository | null
} & Omit<UseCommitsProps, 'serviceId' | 'serviceType'>

export function useLastDeployedCommit({ gitRepository, serviceId, serviceType, ...rest }: UseLastDeployedCommitProps) {
  const enabled = Boolean(gitRepository && serviceId && serviceType)
  const { data: commits, ...props } = useCommits({
    serviceId: serviceId ?? '',
    serviceType: (serviceType ?? 'APPLICATION') as Extract<
      ServiceType,
      'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM' | 'TERRAFORM'
    >,
    ...rest,
    enabled,
  })

  const delta = commits?.findIndex(({ git_commit_id }) => git_commit_id === gitRepository?.deployed_commit_id) ?? 0
  const defaultCommitInfo: Commit = {
    created_at: gitRepository?.deployed_commit_date ?? 'unknown',
    git_commit_id: gitRepository?.deployed_commit_id ?? 'unknown',
    tag: gitRepository?.deployed_commit_tag ?? 'unknown',
    message: 'unknown',
    author_name: gitRepository?.owner ?? gitRepository?.deployed_commit_contributor ?? 'unknown',
  }
  return {
    data: {
      deployedCommit: commits?.[delta] ?? defaultCommitInfo,
      delta,
      commits,
    },
    ...props,
  }
}

export default useLastDeployedCommit

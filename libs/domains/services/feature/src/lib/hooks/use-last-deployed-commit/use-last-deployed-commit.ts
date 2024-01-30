import { type ApplicationGitRepository, type Commit } from 'qovery-typescript-axios'
import { type UseCommitsProps, useCommits } from '../use-commits/use-commits'

export type UseLastDeployedCommitProps = {
  gitRepository: ApplicationGitRepository
} & UseCommitsProps

export function useLastDeployedCommit({ gitRepository, ...useCommitsProps }: UseLastDeployedCommitProps) {
  const { data: commits, ...props } = useCommits(useCommitsProps)

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
      commits,
    },
    ...props,
  }
}

export default useLastDeployedCommit

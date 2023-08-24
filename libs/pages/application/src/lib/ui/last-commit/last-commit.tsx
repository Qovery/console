import { type ApplicationGitRepository, type Commit } from 'qovery-typescript-axios'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { Avatar, Skeleton, TagCommit } from '@qovery/shared/ui'

export interface LastCommitProps {
  commit?: Commit | ApplicationGitRepository
  loadingStatus?: LoadingStatus
  commitDeltaCount?: number
}

export function LastCommit(props: LastCommitProps) {
  const { commit, loadingStatus, commitDeltaCount } = props

  return (
    <div className="flex gap-2 items-center">
      <Skeleton rounded={true} height={32} width={32} show={!loadingStatus || loadingStatus === 'loading'}>
        {(commit as Commit)?.author_name ? (
          <Avatar
            size={28}
            className="border-2 border-neutral-200"
            firstName={(commit as Commit)?.author_name.split(' ')[0] || ''}
            lastName={(commit as Commit)?.author_name.split(' ')[1] || ''}
            url={(commit as Commit)?.author_avatar_url}
          />
        ) : (
          <Avatar
            className="border-2 border-neutral-200"
            size={28}
            firstName={(commit as ApplicationGitRepository)?.owner || ''}
          />
        )}
      </Skeleton>
      <Skeleton height={16} width={60} show={!loadingStatus || loadingStatus === 'loading'}>
        <div className="gap-3 flex items-center">
          <TagCommit
            commitId={(commit as Commit)?.git_commit_id || (commit as ApplicationGitRepository)?.deployed_commit_id}
            commitDeltaCount={commitDeltaCount}
          />
        </div>
      </Skeleton>
    </div>
  )
}

export default LastCommit

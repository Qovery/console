/* eslint-disable-next-line */
import { Commit } from 'qovery-typescript-axios'
import { Avatar, Skeleton, TagCommit } from '@console/shared/ui'
import { LoadingStatus } from '@console/shared/interfaces'
import { timeAgo } from '@console/shared/utils'

export interface LastCommitProps {
  commit?: Commit
  loadingStatus?: LoadingStatus
  commitDeltaCount?: number
}

export function LastCommit(props: LastCommitProps) {
  const { commit, loadingStatus, commitDeltaCount } = props

  return (
    <div className="py-6 px-10">
      <div className="text-subtitle mb-3 text-text-600">Commit</div>
      <div className="flex gap-2 items-center mb-3">
        <Skeleton rounded={true} height={32} width={32} show={!loadingStatus || loadingStatus === 'loading'}>
          <Avatar
            firstName={commit?.author_name || 'e'}
            lastName={commit?.author_name || 'r'}
            url={commit?.author_avatar_url}
          />
        </Skeleton>
        <Skeleton height={16} width={60} show={!loadingStatus || loadingStatus === 'loading'}>
          <>
            <TagCommit commitId={commit?.git_commit_id} /> - {commitDeltaCount} updates since
          </>
        </Skeleton>
      </div>
      <Skeleton height={32} width={200} show={!loadingStatus || loadingStatus === 'loading'} className="mb-2">
        <p className="text-text-500">{commit?.message}</p>
      </Skeleton>
      {commit?.created_at && <span className="text-text-400 text-sm">{timeAgo(new Date(commit?.created_at))}</span>}
    </div>
  )
}

export default LastCommit

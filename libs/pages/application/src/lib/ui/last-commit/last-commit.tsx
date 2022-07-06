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
            className="border-2 border-element-light-lighter-400"
            firstName={commit?.author_name || 'e'}
            lastName={commit?.author_name || 'r'}
            url={commit?.author_avatar_url}
          />
        </Skeleton>
        <Skeleton height={16} width={60} show={!loadingStatus || loadingStatus === 'loading'}>
          <div className="gap-3 flex items-center">
            <TagCommit commitId={commit?.git_commit_id} />
            <span className="flex gap-2 rounded-full items-center h-7 px-3 text-text-500 text-xs font-medium border border-element-light-lighter-400">
              {commitDeltaCount && (
                <span
                  className={`h-4 ${
                    commitDeltaCount >= 100 ? 'w-6' : 'w-4'
                  } rounded-full bg-progressing-400 flex items-center justify-center text-white`}
                >
                  {commitDeltaCount && commitDeltaCount < 100 ? commitDeltaCount : '+99'}
                </span>
              )}{' '}
              update{commitDeltaCount && commitDeltaCount > 1 ? 's' : ''}
            </span>
          </div>
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

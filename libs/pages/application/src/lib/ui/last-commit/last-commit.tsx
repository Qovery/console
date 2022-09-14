import { ApplicationGitRepository, Commit } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { Avatar, Skeleton, TagCommit } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/utils'

export interface LastCommitProps {
  commit?: Commit | ApplicationGitRepository
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
          {(commit as Commit)?.author_name ? (
            <Avatar
              className="border-2 border-element-light-lighter-400"
              firstName={(commit as Commit)?.author_name.split(' ')[0] || ''}
              lastName={(commit as Commit)?.author_name.split(' ')[1] || ''}
              url={(commit as Commit)?.author_avatar_url}
            />
          ) : (
            <Avatar
              className="border-2 border-element-light-lighter-400"
              firstName={(commit as ApplicationGitRepository)?.owner || ''}
            />
          )}
        </Skeleton>
        <Skeleton height={16} width={60} show={!loadingStatus || loadingStatus === 'loading'}>
          <div className="gap-3 flex items-center">
            <TagCommit
              commitId={(commit as Commit)?.git_commit_id || (commit as ApplicationGitRepository)?.deployed_commit_id}
            />
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
      {(commit as Commit)?.message && (
        <Skeleton
          height={32}
          width={200}
          show={!loadingStatus || loadingStatus === 'loading'}
          className="mb-2 overflow-hidden"
        >
          <p className="text-text-500">{(commit as Commit)?.message}</p>
        </Skeleton>
      )}
      <span className="text-text-400 text-sm">
        {(commit as Commit)?.created_at && timeAgo(new Date((commit as Commit)?.created_at))}
        {(commit as ApplicationGitRepository)?.deployed_commit_date &&
          timeAgo(new Date((commit as ApplicationGitRepository)?.deployed_commit_date || ''))}
      </span>
    </div>
  )
}

export default LastCommit

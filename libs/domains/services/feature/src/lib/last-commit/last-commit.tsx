import { type ApplicationGitRepository, type Commit } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Avatar, Button, Icon, IconAwesomeEnum, Tooltip, Truncate } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useCommits } from '../hooks/use-commits/use-commits'

export interface LastCommitProps {
  className?: string
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
}

export function LastCommit({ className, gitRepository, serviceId, serviceType }: LastCommitProps) {
  const { data: commits } = useCommits({ serviceId, serviceType })
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const delta = commits?.findIndex(({ git_commit_id }) => git_commit_id === gitRepository.deployed_commit_id) ?? 0
  const defaultCommitInfo: Commit = {
    created_at: gitRepository.deployed_commit_date ?? 'unknown',
    git_commit_id: gitRepository.deployed_commit_id ?? 'unknown',
    tag: gitRepository.deployed_commit_tag ?? 'unknown',
    message: 'unknown',
    author_name: gitRepository.deployed_commit_contributor ?? 'unknown',
  }
  const deployedCommit = commits?.[delta] ?? defaultCommitInfo

  const onClickCopyToClipboard = (content: string) => {
    copyToClipboard(content)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  if (deployedCommit === undefined) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2">
      {deployedCommit.author_name && deployedCommit.author_avatar_url ? (
        <Avatar
          size={20}
          className="border-2 border-neutral-200"
          firstName={deployedCommit.author_name.split(' ')[0] || ''}
          lastName={deployedCommit.author_name.split(' ')[1] || ''}
          url={deployedCommit.author_avatar_url}
        />
      ) : (
        <Avatar size={20} className="border-2 border-neutral-200" firstName={gitRepository.owner || ''} />
      )}
      {copied ? (
        <Button type="button" variant="solid" color="green" size="xs">
          <Icon name={IconAwesomeEnum.CHECK} className="mr-1" />
          <span>Copied</span>
        </Button>
      ) : (
        <Tooltip
          content={
            <>
              <p>Commit at: {deployedCommit.created_at}</p>
              <p>
                Message: <Truncate text={deployedCommit.message} truncateLimit={50} />
              </p>
            </>
          }
        >
          <span className="relative">
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className={twMerge(`group justify-between ${delta > 0 ? 'w-24 pr-7' : 'w-20'}`, className)}
              onClick={() => onClickCopyToClipboard(deployedCommit.git_commit_id)}
            >
              <Icon name={IconAwesomeEnum.COPY} className="hidden group-hover:inline" />
              <Icon name={IconAwesomeEnum.CODE_COMMIT} className="group-hover:hidden" />
              {deployedCommit.git_commit_id.substring(0, 7)}
              {delta > 0 ? (
                // TODO: improve inset
                <span className="absolute right-0 inset-y-0 bg-orange-500 text-white px-2 rounded-tr rounded-br flex items-center">
                  {delta}
                </span>
              ) : null}
            </Button>
          </span>
        </Tooltip>
      )}
    </div>
  )
}

export default LastCommit

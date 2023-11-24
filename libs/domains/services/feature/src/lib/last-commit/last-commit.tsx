import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Button, Icon, IconAwesomeEnum, Tooltip, Truncate } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'

export interface LastCommitProps {
  className?: string
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
}

export function LastCommit({ className, gitRepository, serviceId, serviceType }: LastCommitProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)
  const {
    data: { deployedCommit, delta },
  } = useLastDeployedCommit({ gitRepository, serviceId, serviceType })

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

  return copied ? (
    <Button
      type="button"
      variant="solid"
      color="green"
      size="xs"
      className="shrink-0 border border-green-500 max-w-max"
    >
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
          className={twMerge(`group justify-between ${delta > 0 ? 'w-[98px] pr-[26px]' : 'gap-1'}`, className)}
          onClick={() => onClickCopyToClipboard(deployedCommit.git_commit_id)}
        >
          <Icon name={IconAwesomeEnum.COPY} className="hidden group-hover:inline w-4" />
          <Icon name={IconAwesomeEnum.CODE_COMMIT} className="group-hover:hidden w-4" />
          {deployedCommit.git_commit_id.substring(0, 7)}
          {delta > 0 ? (
            // TODO: improve inset
            <span className="absolute right-0 inset-y-0 bg-orange-500 text-white px-1 rounded-tr rounded-br flex items-center min-w-[22px] justify-center">
              {delta}
            </span>
          ) : null}
        </Button>
      </span>
    </Tooltip>
  )
}

export default LastCommit

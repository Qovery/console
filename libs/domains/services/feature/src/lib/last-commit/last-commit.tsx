import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Button, CopyToClipboard, Icon, IconAwesomeEnum, Tooltip, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'

export interface LastCommitProps {
  className?: string
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
}

export function LastCommit({ className, gitRepository, serviceId, serviceType }: LastCommitProps) {
  const {
    data: { deployedCommit, delta },
  } = useLastDeployedCommit({ gitRepository, serviceId, serviceType })

  if (deployedCommit === undefined) {
    return null
  }

  return (
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
        <CopyToClipboard text={deployedCommit.git_commit_id}>
          <Button
            type="button"
            variant="surface"
            color="neutral"
            size="xs"
            className={twMerge(`group justify-between ${delta > 0 ? 'w-[98px] pr-[26px]' : 'gap-1'}`, className)}
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
        </CopyToClipboard>
      </span>
    </Tooltip>
  )
}

export default LastCommit

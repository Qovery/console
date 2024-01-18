import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type MouseEvent } from 'react'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Badge, Button, CopyToClipboard, Icon, IconAwesomeEnum, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import useDeployService from '../hooks/use-deploy-service/use-deploy-service'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'
import SelectCommitModal from '../select-commit-modal/select-commit-modal'

export interface LastCommitProps {
  className?: string
  gitRepository: ApplicationGitRepository
  serviceName: string
  serviceId: string
  environmentId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
}

export function LastCommit({
  className,
  serviceName,
  gitRepository,
  serviceId,
  serviceType,
  environmentId,
}: LastCommitProps) {
  const {
    data: { deployedCommit, delta },
  } = useLastDeployedCommit({ gitRepository, serviceId, serviceType })
  const { mutate: deployService } = useDeployService({ environmentId })

  const { openModal, closeModal } = useModal()

  if (deployedCommit === undefined) {
    return null
  }

  const selectCommitModal = (serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'HELM'>) => {
    openModal({
      content: (
        <SelectCommitModal
          title="Deploy a specific commit"
          description="Select the commit id you want to deploy."
          submitLabel="Deploy"
          serviceId={serviceId}
          serviceType={serviceType}
          gitRepository={gitRepository}
          onCancel={closeModal}
          onSubmit={(git_commit_id) => {
            deployService({
              serviceId,
              serviceType,
              request: {
                git_commit_id,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="text-neutral-400 font-medium">{serviceName}</strong>
          </p>
        </SelectCommitModal>
      ),
      options: { width: 596 },
    })
  }

  const deployCommitVersion = (event: MouseEvent) => {
    event.stopPropagation()

    match(serviceType)
      .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => selectCommitModal('JOB'))
      .otherwise((serviceType) => selectCommitModal(serviceType))
  }

  return (
    <Tooltip
      content={
        <>
          {delta > 0 ? <p>This service has a delay of {delta} commits.</p> : null}
          <p>Commit at: {deployedCommit.created_at}</p>
          <p>
            Message: <Truncate text={deployedCommit.message} truncateLimit={50} />
          </p>
        </>
      }
    >
      <span className="relative">
        {delta > 0 ? (
          <Button
            type="button"
            variant="surface"
            color="neutral"
            size="xs"
            className={twMerge(`group justify-between ${delta > 0 ? 'w-[98px] pr-[26px]' : 'gap-1'}`, className)}
            onClick={deployCommitVersion}
          >
            <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="hidden group-hover:inline w-4" />
            <Icon name={IconAwesomeEnum.CODE_COMMIT} className="group-hover:hidden w-4" />
            {deployedCommit.git_commit_id.substring(0, 7)}
            <span
              className="absolute right-0 inset-y-0 bg-brand-500 text-white px-1 rounded-tr rounded-br flex items-center min-w-[22px] justify-center"
              onClick={deployCommitVersion}
            >
              {delta}
            </span>
          </Button>
        ) : (
          <CopyToClipboard text={deployedCommit.git_commit_id}>
            <Badge variant="surface" color="neutral" size="xs" className={twMerge('group justify-between', className)}>
              <Icon name={IconAwesomeEnum.COPY} className="hidden group-hover:inline w-4" />
              <Icon name={IconAwesomeEnum.CODE_COMMIT} className="group-hover:hidden w-4" />
              {deployedCommit.git_commit_id.substring(0, 7)}
            </Badge>
          </CopyToClipboard>
        )}
      </span>
    </Tooltip>
  )
}

export default LastCommit

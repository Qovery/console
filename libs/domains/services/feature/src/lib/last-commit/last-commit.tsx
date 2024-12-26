import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type MouseEvent } from 'react'
import { type Application, type Helm, type Job } from '@qovery/domains/services/data-access'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, CopyToClipboard, Icon, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'
import SelectCommitModal from '../select-commit-modal/select-commit-modal'

export interface LastCommitProps {
  organizationId: string
  projectId: string
  className?: string
  service: Pick<Application | Job | Helm, 'id' | 'name' | 'serviceType' | 'environment'>
  gitRepository: ApplicationGitRepository
}

export function LastCommit({ organizationId, projectId, className, service, gitRepository }: LastCommitProps) {
  const { data: deploymentService } = useDeploymentStatus({
    environmentId: service.environment.id,
    serviceId: service.id,
  })
  const {
    data: { deployedCommit, delta },
  } = useLastDeployedCommit({ gitRepository, serviceId: service.id, serviceType: service.serviceType })
  const { mutate: deployService } = useDeployService({
    environmentId: service.environment.id,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
      DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentService?.execution_id),
  })

  const { openModal, closeModal } = useModal()

  if (deployedCommit === undefined) {
    return null
  }

  const deployCommitVersion = (event: MouseEvent) => {
    event.stopPropagation()

    openModal({
      content: (
        <SelectCommitModal
          title="Deploy a specific commit"
          description="Select the commit id you want to deploy."
          submitLabel="Deploy"
          serviceId={service.id}
          serviceType={service.serviceType}
          gitRepository={gitRepository}
          onCancel={closeModal}
          onSubmit={(git_commit_id) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                git_commit_id,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectCommitModal>
      ),
      options: { width: 596 },
    })
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
            className={twMerge(`group relative justify-between ${delta > 0 ? 'w-[114px] pr-9' : 'gap-1'}`, className)}
            onClick={deployCommitVersion}
          >
            <Icon iconName="rotate-right" iconStyle="regular" className="hidden w-4 group-hover:inline" />
            <Icon iconName="code-commit" iconStyle="regular" className="w-4 group-hover:hidden" />
            {deployedCommit.git_commit_id.substring(0, 7)}
            <span className="absolute -right-[1px] -top-[1px] bottom-0 flex h-[calc(100%+2px)] w-7 items-center justify-center rounded-br rounded-tr bg-brand-500 px-1 text-white">
              <Icon iconName="clock-rotate-left" iconStyle="regular" />
            </span>
          </Button>
        ) : (
          <CopyToClipboard text={deployedCommit.git_commit_id}>
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className={twMerge('group justify-between gap-1', className)}
            >
              <Icon iconName="copy" className="hidden w-4 group-hover:inline" />
              <Icon iconName="code-commit" iconStyle="regular" className="w-4 group-hover:hidden" />
              {deployedCommit.git_commit_id.substring(0, 7)}
            </Button>
          </CopyToClipboard>
        )}
      </span>
    </Tooltip>
  )
}

export default LastCommit

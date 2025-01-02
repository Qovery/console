import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type MouseEvent, useState } from 'react'
import { type Application, type Helm, type Job } from '@qovery/domains/services/data-access'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, CopyToClipboard, Icon, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
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
  const [hover, setHover] = useState(false)
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
    <span className="flex">
      <Tooltip
        content={
          <span className="flex flex-col">
            <span>Commit at: {deployedCommit.created_at}</span>
            <span>
              Message: <Truncate text={deployedCommit.message} truncateLimit={50} />
            </span>
          </span>
        }
      >
        <span>
          <CopyToClipboard text={deployedCommit.git_commit_id} className="flex min-w-[81px] justify-center">
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className="gap-1 rounded-r-none border-r-0 pl-1"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              {hover ? (
                <Icon iconName="copy" iconStyle="solid" className="w-4" />
              ) : (
                <Icon iconName="code-commit" iconStyle="regular" className="w-4" />
              )}
              {deployedCommit.git_commit_id.substring(0, 7)}
            </Button>
          </CopyToClipboard>
        </span>
      </Tooltip>
      <Tooltip content={delta > 0 ? `You have ${delta} commits ahead` : 'Deploy from another version'}>
        <Button
          type="button"
          variant={delta > 0 ? 'solid' : 'surface'}
          color={delta > 0 ? 'brand' : 'neutral'}
          size="xs"
          className="w-7 justify-center gap-1 rounded-l-none px-1.5"
          onClick={deployCommitVersion}
        >
          <span className="flex h-full items-center justify-center">
            <Icon iconName="clock-rotate-left" iconStyle="regular" />
          </span>
        </Button>
      </Tooltip>
    </span>
  )
}

export default LastCommit

import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type MouseEvent } from 'react'
import { type Application, type Helm, type Job } from '@qovery/domains/services/data-access'
import { Button, CopyToClipboard, Icon, IconAwesomeEnum, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'
import SelectCommitModal from '../select-commit-modal/select-commit-modal'

export interface LastCommitProps {
  className?: string
  service: Pick<Application | Job | Helm, 'id' | 'name' | 'serviceType' | 'environment'>
  gitRepository: ApplicationGitRepository
}

export function LastCommit({ className, service, gitRepository }: LastCommitProps) {
  const {
    data: { deployedCommit, delta },
  } = useLastDeployedCommit({ gitRepository, serviceId: service.id, serviceType: service.serviceType })
  const { mutate: deployService } = useDeployService({ environmentId: service.environment.id })

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
            For <strong className="text-neutral-400 font-medium">{service.name}</strong>
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
            className={twMerge(`group justify-between ${delta > 0 ? 'w-[98px] pr-[26px]' : 'gap-1'}`, className)}
            onClick={deployCommitVersion}
          >
            <Icon iconName="rotate-right" className="hidden group-hover:inline w-4" />
            <Icon iconName="code-commit" className="group-hover:hidden w-4" />
            {deployedCommit.git_commit_id.substring(0, 7)}
            <span className="absolute right-0 inset-y-0 bg-brand-500 text-white px-1 rounded-tr rounded-br flex items-center min-w-[22px] justify-center">
              {delta}
            </span>
          </Button>
        ) : (
          <CopyToClipboard text={deployedCommit.git_commit_id}>
            <Button
              type="button"
              variant="surface"
              color="neutral"
              size="xs"
              className={twMerge('group justify-between', className)}
            >
              <Icon iconName="copy" className="hidden group-hover:inline w-4" />
              <Icon iconName="code-commit" className="group-hover:hidden w-4" />
              {deployedCommit.git_commit_id.substring(0, 7)}
            </Button>
          </CopyToClipboard>
        )}
      </span>
    </Tooltip>
  )
}

export default LastCommit

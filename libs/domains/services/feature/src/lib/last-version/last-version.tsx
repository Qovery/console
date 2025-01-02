import { type ContainerSource, type HelmSourceRepositoryResponse } from 'qovery-typescript-axios'
import { type MouseEvent } from 'react'
import { P, match } from 'ts-pattern'
import { type Container, type Helm, type Job } from '@qovery/domains/services/data-access'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Badge, Button, Icon, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import SelectVersionModal from '../select-version-modal/select-version-modal'

export interface LastVersionProps {
  organizationId: string
  projectId: string
  service: Helm | Container | Job
  version: string
}

export function LastVersion({ organizationId, projectId, service, version }: LastVersionProps) {
  const { data: deploymentService } = useDeploymentStatus({
    environmentId: service.environment.id,
    serviceId: service.id,
  })
  const { mutate: deployService } = useDeployService({
    environmentId: service.environment.id,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
      DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentService?.execution_id),
  })

  const { openModal, closeModal } = useModal()

  const deployTagVersion = (service: Container | Job, containerSource: ContainerSource) => {
    openModal({
      content: (
        <SelectVersionModal
          title="Deploy another version"
          description="Select the version you want to deploy."
          submitLabel="Deploy"
          organizationId={organizationId}
          currentVersion={containerSource.tag}
          containerSource={containerSource}
          onCancel={closeModal}
          onSubmit={(image_tag) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                image_tag,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectVersionModal>
      ),
      options: {
        fakeModal: true,
      },
    })
  }
  const deployHelmChartVersion = (service: Helm, repository: HelmSourceRepositoryResponse, version: string) => {
    openModal({
      content: (
        <SelectVersionModal
          title="Deploy another version"
          description="Select the chart version that you want to deploy."
          submitLabel="Deploy"
          currentVersion={version}
          repository={repository}
          organizationId={organizationId}
          onCancel={closeModal}
          onSubmit={(chart_version) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                chart_version,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectVersionModal>
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  const deployVersion = (event: MouseEvent) => {
    event.stopPropagation()

    return match({ service })
      .with(
        { service: { serviceType: 'CONTAINER' } },
        { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobContainerSource) }) },
        ({ service }) => {
          const containerSource = match(service)
            .returnType<ContainerSource>()
            .with({ serviceType: 'CONTAINER' }, (source) => source)
            .with({ serviceType: 'JOB' }, ({ source: { image } }) => image)
            .exhaustive()
          return containerSource && deployTagVersion(service, containerSource)
        }
      )
      .with(
        { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmRepositorySource) }) },
        ({ service }) => {
          const repository = service.source.repository
          const version = repository?.chart_version
          return repository && version && deployHelmChartVersion(service, repository, version)
        }
      )
      .exhaustive()
  }

  return (
    <span className="flex">
      <Badge variant="surface" className="min-w-7 max-w-[81px] rounded-r-none border-r-0 border-neutral-250">
        <span className="flex h-full w-full items-center justify-center truncate">
          <Truncate text={version} truncateLimit={10} />
        </span>
      </Badge>
      <Tooltip content="Deploy from another version">
        <Button
          type="button"
          variant="surface"
          size="xs"
          className="w-7 justify-center gap-1 rounded-l-none px-1.5"
          onClick={(e) => deployVersion(e)}
        >
          <span className="flex h-full items-center justify-center">
            <Icon iconName="clock-rotate-left" iconStyle="regular" />
          </span>
        </Button>
      </Tooltip>
    </span>
  )
}

export default LastVersion

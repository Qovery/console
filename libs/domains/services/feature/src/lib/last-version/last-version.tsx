import clsx from 'clsx'
import { type ContainerSource, type HelmSourceRepositoryResponse } from 'qovery-typescript-axios'
import { type MouseEvent, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type Container, type Helm, type Job } from '@qovery/domains/services/data-access'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { Badge, Button, CopyToClipboard, Icon, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import SelectVersionModal from '../select-version-modal/select-version-modal'

export interface LastVersionProps {
  organizationId: string
  projectId: string
  service: Helm | Container | Job
  version: string
}

export function LastVersion({ organizationId, projectId, service, version }: LastVersionProps) {
  const [hover, setHover] = useState(false)

  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId: service.environment.id,
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
            For <strong className="font-medium text-neutral">{service.name}</strong>
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
            For <strong className="font-medium text-neutral">{service.name}</strong>
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
      <CopyToClipboard text={version} className="flex min-w-fit justify-center">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="xs"
          className={clsx('pl-1', {
            'rounded-r-none border-r-0': true,
          })}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {hover ? <Icon iconName="copy" className="w-4" /> : <Icon iconName="tag" className="w-4" />}
          <Truncate text={version} truncateLimit={8} />
        </Button>
      </CopyToClipboard>
      <Tooltip content="Deploy from another version">
        <Button
          type="button"
          aria-label="Deploy from another version"
          variant="outline"
          size="xs"
          iconOnly
          className="w-7 justify-center rounded-l-none px-1.5"
          onClick={(e) => deployVersion(e)}
        >
          <span className="flex h-full items-center justify-center">
            <Icon iconName="clock-rotate-left" />
          </span>
        </Button>
      </Tooltip>
    </span>
  )
}

export default LastVersion

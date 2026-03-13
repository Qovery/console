import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ServiceStorageStorageInner } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { type AnyService, type Application, type Container } from '@qovery/domains/services/data-access'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  EmptyState,
  Icon,
  InputText,
  LoaderSpinner,
  Section,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { ApplicationContainerStorageModal } from '../application-container-storage-modal/application-container-storage-modal'

const StorageSettingsContentFallback = () => (
  <div className="flex justify-center py-12">
    <LoaderSpinner />
  </div>
)

const isSupportedService = (service?: AnyService): service is Application | Container =>
  service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER'

interface StorageSettingsInnerContentProps {
  onOpenStorageModal: (storage?: ServiceStorageStorageInner) => void
  onDeleteStorage: (storage: ServiceStorageStorageInner) => void
}

function StorageSettingsInnerContent({ onOpenStorageModal, onDeleteStorage }: StorageSettingsInnerContentProps) {
  const { environmentId, serviceId } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId, suspense: true })

  if (!service || !deploymentStatus || !isSupportedService(service)) {
    return null
  }

  const storages = service.storage ?? []

  return storages.length > 0 ? (
    <BlockContent title="Storage" classNameContent="p-0">
      {storages.map((storage, index) => (
        <div
          key={storage.id ?? `${storage.mount_point}-${storage.size}-${storage.type}-${index}`}
          className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
          data-testid="form-row"
        >
          <div className="flex flex-col">
            <h2 className="mb-1 flex text-xs font-medium text-neutral">Storage #{index + 1}</h2>
            <div className="flex gap-3 text-xs text-neutral-subtle">
              <p>
                Size: <span className="text-neutral">{storage.size.toString()} GiB</span>
              </p>
              <p>
                Path: <span className="text-neutral">{storage.mount_point}</span>
              </p>
              <p>
                Type: <span className="text-neutral">{storage.type}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="edit-button"
              variant="outline"
              color="neutral"
              size="md"
              type="button"
              onClick={() => onOpenStorageModal(storage)}
              iconOnly
            >
              <Icon iconName="gear" iconStyle="regular" />
            </Button>
            <Button
              data-testid="delete-button"
              variant="outline"
              color="neutral"
              size="md"
              type="button"
              iconOnly
              onClick={() => onDeleteStorage(storage)}
            >
              <Icon iconName="trash" iconStyle="regular" />
            </Button>
          </div>
        </div>
      ))}
    </BlockContent>
  ) : (
    <EmptyState
      icon="hard-drive"
      title="No storage are set"
      description="Qovery applications can use storage to store data that persists across deploys and restarts, making it easy to deploy stateful applications."
    />
  )
}

export function ApplicationContainerStorageSettings() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId, suspense: true })
  const { mutate: editService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  if (service && !isSupportedService(service)) {
    return null
  }

  const disableAdd = !isSupportedService(service) || deploymentStatus?.state !== 'READY'

  const openStorageModal = (storage?: ServiceStorageStorageInner) => {
    if (!isSupportedService(service)) {
      return
    }

    openModal({
      content: (
        <ApplicationContainerStorageModal
          organizationId={organizationId}
          projectId={projectId}
          service={service}
          storage={storage}
          onClose={closeModal}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const onDeleteStorage = (storage: ServiceStorageStorageInner) => {
    if (!isSupportedService(service)) {
      return
    }

    openModalConfirmation({
      title: 'Delete storage',
      name: storage.mount_point,
      confirmationMethod: 'action',
      action: () => {
        editService({
          serviceId: service.id,
          payload: match(service)
            .with({ serviceType: 'APPLICATION' }, (application) =>
              buildEditServicePayload({
                service: application,
                request: {
                  storage: (service.storage ?? []).filter(({ id }) => id !== storage.id),
                },
              })
            )
            .with({ serviceType: 'CONTAINER' }, (container) =>
              buildEditServicePayload({
                service: container,
                request: {
                  storage: (service.storage ?? []).filter(({ id }) => id !== storage.id),
                },
              })
            )
            .exhaustive(),
        })
      },
    })
  }

  return (
    <Section className="p-8">
      <div className="space-y-6">
        <SettingsHeading title="Storage" description="Add persistent local storage for your application.">
          <Tooltip
            disabled={!disableAdd}
            content="Storage can be added only to services that have never been deployed before"
          >
            <Button
              size="md"
              variant="solid"
              color="brand"
              type="button"
              onClick={() => openStorageModal()}
              disabled={disableAdd}
              className="gap-2"
            >
              Add Storage
              <Icon iconName="circle-plus" iconStyle="regular" />
            </Button>
          </Tooltip>
        </SettingsHeading>

        <div className="max-w-content-with-navigation-left">
          <Suspense fallback={<StorageSettingsContentFallback />}>
            <StorageSettingsInnerContent
              environmentId={environmentId}
              serviceId={serviceId}
              onOpenStorageModal={openStorageModal}
              onDeleteStorage={onDeleteStorage}
            />
          </Suspense>
        </div>
      </div>
    </Section>
  )
}

export default ApplicationContainerStorageSettings

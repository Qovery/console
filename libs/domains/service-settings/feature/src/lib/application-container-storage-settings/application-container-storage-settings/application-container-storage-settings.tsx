import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ServiceStorageStorageInner } from 'qovery-typescript-axios'
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

  const storages = isSupportedService(service) ? service.storage ?? [] : []

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
          {!service || !deploymentStatus ? (
            <StorageSettingsContentFallback />
          ) : storages.length > 0 ? (
            <BlockContent title="Storage">
              {storages.map((storage, index) => (
                <div
                  key={storage.id ?? `${storage.mount_point}-${storage.size}-${storage.type}`}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3',
                    storages.length !== index + 1 && 'mb-5'
                  )}
                  data-testid="form-row"
                >
                  <InputText
                    name={`size-${storage.id ?? index}`}
                    className="flex-1 shrink-0 grow"
                    value={storage.size.toString()}
                    label="Size in GiB"
                    disabled
                  />

                  <InputText
                    name={`path-${storage.id ?? index}`}
                    className="flex-1 shrink-0 grow"
                    value={storage.mount_point}
                    label="Path"
                    disabled
                  />

                  <InputText
                    name={`type-${storage.id ?? index}`}
                    className="flex-1 shrink-0 grow"
                    value={storage.type}
                    label="Type"
                    disabled
                  />

                  <Button
                    data-testid="edit-button"
                    variant="outline"
                    color="neutral"
                    size="lg"
                    type="button"
                    className="h-[52px] w-[52px] justify-center"
                    onClick={() => openStorageModal(storage)}
                  >
                    <Icon iconName="gear" iconStyle="regular" />
                  </Button>
                  <Button
                    data-testid="delete-button"
                    variant="outline"
                    color="neutral"
                    size="lg"
                    type="button"
                    className="h-[52px] w-[52px] justify-center"
                    onClick={() => onDeleteStorage(storage)}
                  >
                    <Icon iconName="trash" iconStyle="regular" />
                  </Button>
                </div>
              ))}
            </BlockContent>
          ) : (
            <EmptyState
              icon="hard-drive"
              title="No storage are set"
              description="Qovery applications can use storage to store data that persists across deploys and restarts, making it easy to deploy stateful applications."
            />
          )}
        </div>
      </div>
    </Section>
  )
}

export default ApplicationContainerStorageSettings

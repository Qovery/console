import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'
import StorageModalFeature from './storage-modal-feature/storage-modal-feature'

export function PageSettingsStorageFeature() {
  const { environmentId = '', applicationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: service } = useService({ environmentId: environmentId, serviceId: applicationId })
  const { mutateAsync: editService } = useEditService({ environmentId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (service) => {
      return (
        deploymentStatus && (
          <PageSettingsStorage
            storages={service.storage || []}
            deploymentState={deploymentStatus.state}
            onRemove={(storage) => {
              openModalConfirmation({
                title: 'Delete storage',
                name: storage.mount_point,
                isDelete: true,
                action: async () => {
                  const request = {
                    storage: service.storage?.filter((s) => s.id !== storage.id),
                  }

                  const payload = match(service)
                    .with({ serviceType: 'APPLICATION' }, (s) => buildEditServicePayload({ service: s, request }))
                    .with({ serviceType: 'CONTAINER' }, (s) => buildEditServicePayload({ service: s, request }))
                    .exhaustive()

                  try {
                    await editService({
                      serviceId: service.id,
                      payload: payload,
                    })
                    closeModal()
                  } catch (error) {
                    console.error(error)
                  }
                },
              })
            }}
            onEdit={(storage) => {
              openModal({
                content: <StorageModalFeature onClose={closeModal} storage={storage} service={service} />,
              })
            }}
            onAddStorage={() => {
              openModal({
                content: <StorageModalFeature onClose={closeModal} service={service} />,
              })
            }}
          />
        )
      )
    })
    .otherwise(() => null)
}

export default PageSettingsStorageFeature

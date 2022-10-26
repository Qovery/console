import { ServiceStorageStorage } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editApplication,
  getApplicationsState,
  postApplicationActionsRestart,
  selectApplicationById,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'
import StorageModalFeature from './storage-modal-feature/storage-modal-feature'

export const removeStorage = (storage: ServiceStorageStorage, application: ApplicationEntity) => {
  const app = { ...application }
  app.storage = app.storage?.filter((s) => s.id !== storage.id)
  return app
}

export function PageSettingsStorageFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const error = useSelector((state: RootState) => getApplicationsState(state).error)

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => a?.id === b?.id && JSON.stringify(a?.storage) === JSON.stringify(b?.storage)
  )

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRestart({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  return (
    <PageSettingsStorage
      storages={application?.storage || []}
      onRemove={(storage: ServiceStorageStorage) => {
        openModalConfirmation({
          title: 'Delete storage',
          description: 'To confirm the deletion of this storage, please type the name of the application',
          name: application?.name,
          isDelete: true,
          action: async () => {
            if (!application) return
            const app = removeStorage(storage, application)
            await dispatch(
              editApplication({
                applicationId: app.id,
                data: app,
                serviceType: getServiceType(application),
                toasterCallback,
              })
            )

            if (!error) {
              closeModal()
            }
          },
        })
      }}
      onEdit={(storage?: ServiceStorageStorage) => {
        openModal({
          content: (
            <StorageModalFeature
              onClose={closeModal}
              storage={storage}
              applicationId={applicationId}
              application={application}
            />
          ),
        })
      }}
      onAddStorage={() => {
        openModal({
          content: <StorageModalFeature onClose={closeModal} applicationId={applicationId} application={application} />,
        })
      }}
    />
  )
}

export default PageSettingsStorageFeature

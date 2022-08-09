import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { ApplicationEntity } from '@console/shared/interfaces'
import {
  editApplication,
  fetchApplication,
  getApplicationsState,
  selectApplicationById,
} from '@console/domains/application'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'
import { useModal, useModalConfirmation } from '@console/shared/ui'
import StorageModalFeature from './storage-modal-feature/storage-modal-feature'
import { ApplicationStorageStorage } from 'qovery-typescript-axios'

export const removeStorage = (storage: ApplicationStorageStorage, application: ApplicationEntity) => {
  const app = { ...application }
  app.storage = app.storage?.filter((s) => s.id !== storage.id)
  return app
}

export function PageSettingsStorageFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)
  const error = useSelector((state: RootState) => getApplicationsState(state).error)

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => {
      return a?.id === b?.id && JSON.stringify(a?.storage) === JSON.stringify(b?.storage)
    }
  )

  if (loadingStatus === 'not loaded') {
    dispatch(fetchApplication({ applicationId }))
  }

  return (
    <PageSettingsStorage
      storages={application?.storage || []}
      onRemove={(storage: ApplicationStorageStorage) => {
        openModalConfirmation({
          title: 'Delete Storage',
          description: 'To confirm the deletion of this storage, please type the name of the application',
          name: application?.name,
          isDelete: true,
          action: async () => {
            if (!application) return
            const app = removeStorage(storage, application)
            await dispatch(editApplication({ applicationId: app.id, data: app }))

            if (!error) {
              closeModal()
            }
          },
        })
      }}
      onEdit={(storage?: ApplicationStorageStorage) => {
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

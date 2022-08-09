import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { fetchApplication, selectApplicationById } from '@console/domains/application'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'
import { useModal, useModalConfirmation } from '@console/shared/ui'
import StorageModalFeature from './storage-modal-feature/storage-modal-feature'
import { ApplicationStorageStorage } from 'qovery-typescript-axios'

export function PageSettingsStorageFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => state.entities.applications.loadingStatus)
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => {
      return a?.id === b?.id
    }
  )

  if (loadingStatus === 'not loaded') {
    dispatch(fetchApplication({ applicationId }))
  }

  return (
    <PageSettingsStorage
      storages={application?.storage || []}
      onRemove={() => {
        openModalConfirmation({
          title: 'Delete Storage',
          description: 'To confirm the deletion of this storage, please type the name of the application',
          name: application?.name,
          isDelete: true,
          action: async () => {},
        })
      }}
      onEdit={(storage?: ApplicationStorageStorage) => {
        openModal({
          content: <StorageModalFeature onClose={closeModal} storage={storage} applicationId={applicationId} />,
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

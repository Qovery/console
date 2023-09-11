import { type ServiceStorageStorage } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  editApplication,
  getApplicationsState,
  postApplicationActionsRedeploy,
  selectApplicationById,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'
import StorageModalFeature from './storage-modal-feature/storage-modal-feature'

export const removeStorage = (storage: ServiceStorageStorage, application: ApplicationEntity) => {
  const app = { ...application }
  app.storage = app.storage?.filter((s) => s.id !== storage.id)
  return app
}

export function PageSettingsStorageFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
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
        postApplicationActionsRedeploy({
          applicationId,
          environmentId,
          serviceType: getServiceType(application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
        })
      )
    }
  }

  return (
    <PageSettingsStorage
      storages={application?.storage || []}
      onRemove={(storage: ServiceStorageStorage) => {
        openModalConfirmation({
          title: 'Delete storage',
          name: storage.mount_point,
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
              organizationId={organizationId}
              projectId={projectId}
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
          content: (
            <StorageModalFeature
              organizationId={organizationId}
              projectId={projectId}
              onClose={closeModal}
              applicationId={applicationId}
              application={application}
            />
          ),
        })
      }}
    />
  )
}

export default PageSettingsStorageFeature

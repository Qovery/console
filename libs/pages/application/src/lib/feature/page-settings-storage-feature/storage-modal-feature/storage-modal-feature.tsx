import { useQueryClient } from '@tanstack/react-query'
import { type ServiceStorageStorageInner, StorageTypeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import StorageModal from '../../../ui/page-settings-storage/storage-modal/storage-modal'

export interface StorageModalFeatureProps {
  storage?: ServiceStorageStorageInner
  application?: ApplicationEntity
  organizationId: string
  projectId: string
  applicationId: string
  onClose: () => void
}

export const handleSubmit = (
  data: { size: number; type: StorageTypeEnum; mount_point: string },
  application: ApplicationEntity,
  storage?: ServiceStorageStorageInner
) => {
  const app = { ...application }

  // edit mode
  if (storage?.id) {
    const editedStorage: ServiceStorageStorageInner = { id: storage.id, ...data }
    app.storage = app.storage?.filter((s) => s.id !== storage.id)
    app.storage?.push(editedStorage)
  } else {
    // creation mode
    app.storage = [...(app.storage || []), data] as ServiceStorageStorageInner[]
  }

  return app
}

export function StorageModalFeature(props: StorageModalFeatureProps) {
  const queryClient = useQueryClient()
  const methods = useForm({
    defaultValues: {
      size: props.storage?.size || 4,
      type: props.storage?.type || StorageTypeEnum.FAST_SSD,
      mount_point: props.storage?.mount_point || '',
    },
    mode: 'onChange',
  })
  const navigate = useNavigate()

  const toasterCallback = () => {
    if (props.application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId: props.application.id,
          environmentId: props.application.environment?.id || '',
          serviceType: getServiceType(props.application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(props.organizationId, props.projectId, props.application?.environment?.id) +
                DEPLOYMENT_LOGS_URL(props.application?.id)
            ),
          queryClient,
        })
      )
    }
  }

  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)
  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) {
      return
    }
    const app = handleSubmit(data, props.application, props.storage)
    dispatch(
      editApplication({
        data: app,
        applicationId: app.id,
        serviceType: getServiceType(app),
        toasterCallback,
        queryClient,
      })
    )
      .unwrap()
      .then(() => props.onClose())
      .catch((e) => console.error(e))
  })

  return (
    <FormProvider {...methods}>
      <StorageModal
        onClose={props.onClose}
        onSubmit={onSubmit}
        isEdit={!!props.storage}
        loading={loadingStatus === 'loading'}
      />
    </FormProvider>
  )
}

export default StorageModalFeature

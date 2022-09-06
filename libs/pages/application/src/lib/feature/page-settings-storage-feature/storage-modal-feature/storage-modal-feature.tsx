import { ApplicationStorageStorage, StorageTypeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { editApplication, getApplicationsState, postApplicationActionsRestart } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import StorageModal from '../../../ui/page-settings-storage/storage-modal/storage-modal'

export interface StorageModalFeatureProps {
  storage?: ApplicationStorageStorage
  application?: ApplicationEntity
  applicationId: string
  onClose: () => void
}

export const handleSubmit = (
  data: { size: number; type: StorageTypeEnum; mount_point: string },
  application: ApplicationEntity,
  storage?: ApplicationStorageStorage
) => {
  const app = { ...application }

  // edit mode
  if (storage?.id) {
    const editedStorage: ApplicationStorageStorage = { id: storage.id, ...data }
    app.storage = app.storage?.filter((s) => s.id !== storage.id)
    app.storage?.push(editedStorage)
  } else {
    // creation mode
    app.storage = [...(app.storage || []), data]
  }

  return app
}

export function StorageModalFeature(props: StorageModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      size: props.storage?.size || 4,
      type: props.storage?.type || StorageTypeEnum.FAST_SSD,
      mount_point: props.storage?.mount_point || '',
    },
    mode: 'onChange',
  })

  const toasterCallback = () => {
    dispatch(
      postApplicationActionsRestart({
        applicationId: props.application?.id || '',
        environmentId: props.application?.environment?.id || '',
      })
    )
  }

  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)
  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) {
      return
    }
    const app = handleSubmit(data, props.application, props.storage)
    dispatch(editApplication({ data: app, applicationId: app.id, toasterCallback }))
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

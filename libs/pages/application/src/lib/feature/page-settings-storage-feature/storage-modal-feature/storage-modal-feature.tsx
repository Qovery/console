import { ApplicationStorageStorage, StorageTypeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import StorageModal from '../../../ui/page-settings-storage/storage-modal/storage-modal'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch } from '@console/store/data'
import { useDispatch } from 'react-redux'
import { editApplication } from '@console/domains/application'

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
    app.storage?.forEach((storage) => {
      if (storage.id === storage?.id) {
        storage.size = data.size
        storage.type = data.type
        storage.mount_point = data.mount_point
      }
    })
  } else {
    // creation mode
    app.storage = [...(app.storage || []), data]
  }

  return app
}

export function StorageModalFeature(props: StorageModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      size: props.storage?.size || 0,
      type: props.storage?.type || StorageTypeEnum.FAST_SSD,
      mount_point: props.storage?.mount_point || '',
    },
    mode: 'onChange',
  })

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) {
      return
    }
    const app = handleSubmit(data, props.application, props.storage)
    dispatch(editApplication({ data: app, applicationId: app.id }))
  })

  return (
    <FormProvider {...methods}>
      <StorageModal onClose={props.onClose} onSubmit={onSubmit} isEdit={!!props.storage} />
    </FormProvider>
  )
}

export default StorageModalFeature

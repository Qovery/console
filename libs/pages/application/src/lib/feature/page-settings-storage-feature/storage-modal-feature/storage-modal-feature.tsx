import { ApplicationStorageStorage, StorageTypeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import StorageModal from '../../../ui/page-settings-storage/storage-modal/storage-modal'

export interface StorageModalFeatureProps {
  storage?: ApplicationStorageStorage
  applicationId: string
  onClose: () => void
}

export function StorageModalFeature(props: StorageModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      size: props.storage?.size || '',
      type: props.storage?.type || StorageTypeEnum.FAST_SSD,
      mount_point: props.storage?.mount_point || '',
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    console.log(data)
  })

  return (
    <FormProvider {...methods}>
      <StorageModal onClose={props.onClose} onSubmit={onSubmit} isEdit={!!props.storage} />
    </FormProvider>
  )
}

export default StorageModalFeature

import { type ServiceStorageStorageInner, StorageTypeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type Application, type Container } from '@qovery/domains/services/data-access'
import { useEditService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import StorageModal from '../../../ui/page-settings-storage/storage-modal/storage-modal'

export interface StorageModalFeatureProps {
  service: Application | Container
  onClose: () => void
  storage?: ServiceStorageStorageInner
}

export function StorageModalFeature({ service, storage, onClose }: StorageModalFeatureProps) {
  const { mutateAsync: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId: service.environment.id,
  })

  const methods = useForm({
    defaultValues: {
      size: storage?.size || 4,
      type: storage?.type || StorageTypeEnum.FAST_SSD,
      mount_point: storage?.mount_point || '',
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const request = storage?.id
      ? {
          storage: service.storage?.map((s) => (s.id === storage.id ? { ...s, ...data } : s)),
        }
      : {
          storage: [...(service.storage || []), data],
        }

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => buildEditServicePayload({ service: s, request }))
      .with({ serviceType: 'CONTAINER' }, (s) => buildEditServicePayload({ service: s, request }))
      .exhaustive()

    try {
      await editService({
        serviceId: service.id,
        payload,
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <StorageModal onClose={onClose} onSubmit={onSubmit} isEdit={!!storage} loading={isLoadingEditService} />
    </FormProvider>
  )
}

export default StorageModalFeature

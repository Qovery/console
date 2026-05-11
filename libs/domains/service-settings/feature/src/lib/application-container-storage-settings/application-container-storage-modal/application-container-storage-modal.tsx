import { type ServiceStorageStorageInner, StorageTypeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type Application, type Container } from '@qovery/domains/services/data-access'
import { useEditService } from '@qovery/domains/services/feature'
import { InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export interface ApplicationContainerStorageModalProps {
  organizationId: string
  projectId: string
  service: Application | Container
  onClose: () => void
  storage?: ServiceStorageStorageInner
}

interface StorageFormData {
  size: number
  type: StorageTypeEnum
  mount_point: string
}

export function ApplicationContainerStorageModal({
  organizationId,
  projectId,
  service,
  onClose,
  storage,
}: ApplicationContainerStorageModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { mutateAsync: editService, isLoading } = useEditService({
    organizationId,
    projectId,
    environmentId: service.environment.id,
  })

  const methods = useForm<StorageFormData>({
    defaultValues: {
      size: storage?.size ?? 4,
      type: storage?.type ?? StorageTypeEnum.FAST_SSD,
      mount_point: storage?.mount_point ?? '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [enableAlertClickOutside, methods.formState.isDirty])

  const onSubmit = methods.handleSubmit(async (data) => {
    const request = storage?.id
      ? {
          storage: service.storage?.map((serviceStorage) =>
            serviceStorage.id === storage.id ? { ...serviceStorage, ...data } : serviceStorage
          ),
        }
      : {
          storage: [...(service.storage ?? []), data],
        }

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (application) => buildEditServicePayload({ service: application, request }))
      .with({ serviceType: 'CONTAINER' }, (container) => buildEditServicePayload({ service: container, request }))
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
      <ModalCrud
        title={storage ? 'Edit storage' : 'Create storage'}
        isEdit={Boolean(storage)}
        loading={isLoading}
        onSubmit={onSubmit}
        onClose={onClose}
      >
        <Controller
          name="size"
          control={methods.control}
          rules={{
            required: 'Please enter a value.',
            max: {
              value: 512,
              message: 'The hard disk space must be between 4 and 512 GB.',
            },
            min: {
              value: 4,
              message: 'The hard disk space must be between 4 and 512 GB.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Size in GiB"
              type="number"
              autoFocus
            />
          )}
        />

        <Controller
          name="mount_point"
          control={methods.control}
          rules={{
            required: 'Please enter a value.',
            pattern: {
              message: 'The mount point must start with a slash',
              value: /^\/.?\w+.*/,
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Mounting Path"
            />
          )}
        />

        <Controller
          name="type"
          control={methods.control}
          rules={{
            required: 'Please enter a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={(value) => field.onChange(value)}
              value={field.value}
              error={error?.message}
              options={Object.values(StorageTypeEnum).map((type) => ({ value: type, label: type }))}
              label="Type"
              disabled
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ApplicationContainerStorageModal

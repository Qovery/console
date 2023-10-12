import { StorageTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'

export interface StorageModalProps {
  onClose: () => void
  isEdit?: boolean
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StorageModal(props: StorageModalProps) {
  const { control, formState } = useFormContext()
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState])

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit storage' : 'Create storage'}
      isEdit={props.isEdit}
      loading={props.loading}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
    >
      <>
        <Controller
          name="size"
          control={control}
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
            />
          )}
        />

        <Controller
          name="mount_point"
          control={control}
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
          control={control}
          rules={{
            required: 'Please enter a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              options={Object.values(StorageTypeEnum).map((s) => ({ value: s, label: s }))}
              label="Type"
              disabled
            />
          )}
        />
      </>
    </ModalCrud>
  )
}

export default StorageModal

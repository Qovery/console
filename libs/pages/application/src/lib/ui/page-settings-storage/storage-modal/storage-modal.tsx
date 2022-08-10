import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'
import { StorageTypeEnum } from 'qovery-typescript-axios'
import { FormEventHandler, useEffect } from 'react'

export interface StorageModalProps {
  onClose: () => void
  isEdit?: boolean
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StorageModal(props: StorageModalProps) {
  const { control, formState, trigger } = useFormContext()

  useEffect(() => {
    if (props.isEdit) trigger().then()
  }, [trigger, props.isEdit])

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-6 max-w-sm">{props.isEdit ? 'Edit storage' : 'Create storage'}</h2>

      <form onSubmit={props.onSubmit}>
        <Controller
          name={'size'}
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
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Size in GB"
              type="number"
            />
          )}
        />

        <Controller
          name={'mount_point'}
          control={control}
          rules={{
            required: 'Please enter a value.',
            pattern: {
              value: /^\/[a-zA-Z0-9]+$/i,
              message: 'The mount point must start with a slash',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Path"
            />
          )}
        />

        <Controller
          name={'type'}
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
              items={Object.values(StorageTypeEnum).map((s) => ({ value: s, label: s }))}
              label="Type"
              disabled
            />
          )}
        />
        <div className="flex gap-3 justify-end mt-6">
          <Button
            className="btn--no-min-w"
            style={ButtonStyle.STROKED}
            size={ButtonSize.XLARGE}
            onClick={() => props.onClose()}
          >
            Cancel
          </Button>
          <Button
            dataTestId="submit-button"
            className="btn--no-min-w"
            type="submit"
            size={ButtonSize.XLARGE}
            disabled={!formState.isValid}
            loading={props.loading}
          >
            {props.isEdit ? 'Edit' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StorageModal

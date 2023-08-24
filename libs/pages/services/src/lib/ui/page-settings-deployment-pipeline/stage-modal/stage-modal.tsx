import { type FormEventHandler, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'

export interface StageModalProps {
  onClose: () => void
  isEdit?: boolean
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StageModal(props: StageModalProps) {
  const { control, formState } = useFormContext()
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState])

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit stage' : 'Create stage'}
      isEdit={props.isEdit}
      loading={props.loading}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
    >
      <>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              dataTestId="input-name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Name"
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Description (optional)"
            />
          )}
        />
      </>
    </ModalCrud>
  )
}

export default StageModal

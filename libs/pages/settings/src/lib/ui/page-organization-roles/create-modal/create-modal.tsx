import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'

export interface CreateModalProps {
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

export function CreateModal(props: CreateModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Add new role"
      description="Give a name and a description to your new role."
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
    >
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-name"
            className="mb-5"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            dataTestId="input-description"
            className="mb-5"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
            error={error?.message}
          />
        )}
      />
    </ModalCrud>
  )
}

export default CreateModal

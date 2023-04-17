import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud title="Create new API token" onSubmit={props.onSubmit} onClose={props.onClose} loading={props.loading}>
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a token name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-name"
            className="mb-5"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Token name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
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

export default CrudModal

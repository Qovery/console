import { CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputText, ModalCrud } from '@console/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit DNS configuration' : 'Set DNS configuration'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="domain"
        control={control}
        rules={{
          required: 'Please enter a domain',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-6"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Domain"
            error={error?.message}
          />
        )}
      />
    </ModalCrud>
  )
}

export default CrudModal

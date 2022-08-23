import { ServicePortPorts } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputToggle, ModalCrud } from '@console/shared/ui'

export interface CrudModalProps {
  port?: ServicePortPorts
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control } = useFormContext()

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit port' : 'Set port'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="internal_port"
        control={control}
        rules={{
          required: 'Please enter an internal port.',
          pattern: pattern,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            type="number"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Application port"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="external_port"
        control={control}
        rules={{
          pattern: pattern,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-5"
            type="number"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Application port (Secure)"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="publicly_accessible"
        control={control}
        render={({ field }) => (
          <div onClick={() => field.onChange(!field.value)} className="flex items-center mr-4 mb-2">
            <InputToggle onChange={field.onChange} value={field.value} title={field.value} small />
            <span className="text-text-600 text-ssm font-medium cursor-pointer">
              {field.value ? 'Public' : 'Private'}
            </span>
          </div>
        )}
      />
    </ModalCrud>
  )
}

export default CrudModal

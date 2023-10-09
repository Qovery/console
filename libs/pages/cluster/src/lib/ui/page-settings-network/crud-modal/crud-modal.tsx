import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'

export interface CrudModalProps {
  route?: ClusterRoutingTableResultsInner
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit route' : 'Set route'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="destination"
        control={control}
        rules={{
          required: 'Please enter an destination.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-destination"
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Destination"
            error={error?.message}
            disabled={props.isEdit}
          />
        )}
      />
      <Controller
        name="target"
        control={control}
        rules={{
          required: 'Please enter an target.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-target"
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Target"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        rules={{
          required: 'Please enter an description.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            className="mb-3"
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

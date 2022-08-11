import { CustomDomain } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonStyle, InputText } from '@console/shared/ui'

export interface CrudModalProps {
  customDomain?: CustomDomain
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}

export function CrudModal(props: CrudModalProps) {
  const { control, formState } = useFormContext()

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-6 max-w-sm">
        {props.isEdit ? 'Edit DNS configuration' : 'Set DNS configuration'}
      </h2>

      <form onSubmit={props.onSubmit}>
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

        <div className="flex gap-3 justify-end">
          <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={() => props.onClose()}>
            Cancel
          </Button>
          <Button
            className="btn--no-min-w"
            dataTestId="submit-button"
            type="submit"
            disabled={!formState.isValid}
            loading={props.loading}
          >
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CrudModal

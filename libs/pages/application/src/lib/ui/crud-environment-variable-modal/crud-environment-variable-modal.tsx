import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonStyle, InputSelect, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'
import {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../../feature/crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'

export interface CrudEnvironmentVariableModalProps {
  mode: EnvironmentVariableCrudMode
  type?: EnvironmentVariableType
  title: string
  description: string
  onSubmit: () => void
  closeModal: () => void
  availableScopes: APIVariableScopeEnum[]
  loading: boolean
}

export function CrudEnvironmentVariableModal(props: CrudEnvironmentVariableModalProps) {
  const { control, formState } = useFormContext()

  const validationRuleForValue: { required?: string } =
    props.type === EnvironmentVariableType.ALIAS
      ? {}
      : {
          required: 'Please enter a value.',
        }

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">{props.title}</h2>
      <p className="text-text-400 text-sm mb-6">{props.description}</p>
      <form onSubmit={props.onSubmit}>
        <Controller
          name="key"
          control={control}
          rules={{
            required: 'Please enter a variable key.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Variable"
              error={error?.message}
              disabled={props.type === EnvironmentVariableType.OVERRIDE}
            />
          )}
        />
        <Controller
          name="value"
          control={control}
          rules={validationRuleForValue}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Value"
              error={error?.message}
              disabled={props.type === EnvironmentVariableType.ALIAS}
            />
          )}
        />
        <Controller
          name="scope"
          control={control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field }) => (
            <InputSelect
              className="mb-6"
              portal
              options={props.availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
              onChange={field.onChange}
              value={field.value}
              label="Scope"
            />
          )}
        />

        {props.mode === EnvironmentVariableCrudMode.CREATION && props.type === EnvironmentVariableType.NORMAL && (
          <div className="flex items-center gap-3 mb-8">
            <Controller
              name="isSecret"
              control={control}
              render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} />}
            />
            <p className="text-text-500 text-sm font-medium">Secret variable</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={() => props.closeModal()}>
            Cancel
          </Button>
          <Button className="btn--no-min-w" type="submit" disabled={!formState.isValid} loading={props.loading}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CrudEnvironmentVariableModal

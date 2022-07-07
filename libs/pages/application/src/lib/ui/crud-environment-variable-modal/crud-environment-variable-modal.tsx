import { Button, ButtonStyle, InputSelect, InputText, InputTextArea } from '@console/shared/ui'
import { Control, Controller, FormState } from 'react-hook-form'
import {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../../feature/crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'

export interface CrudEnvironmentVariableModalProps {
  mode: EnvironmentVariableCrudMode
  type?: EnvironmentVariableType
  title: string
  description: string
  onSubmit: () => void
  control: Control<{ key: string; value: string; scope: string }>
  formState: FormState<{ key: string; value: string; scope: string }>
  setOpen: (open: boolean) => void
}

export function CrudEnvironmentVariableModal(props: CrudEnvironmentVariableModalProps) {
  console.log(props.formState)
  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">{props.title}</h2>
      <p className="text-text-400 text-sm mb-6">{props.description}</p>
      <form onSubmit={props.onSubmit}>
        <Controller
          name="key"
          control={props.control}
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
            />
          )}
        />
        <Controller
          name="value"
          control={props.control}
          rules={{
            required: 'Please enter a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Value"
            />
          )}
        />
        <Controller
          name="scope"
          control={props.control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              items={[
                {
                  label: EnvironmentVariableScopeEnum.PROJECT.toString().toLowerCase(),
                  value: EnvironmentVariableScopeEnum.PROJECT,
                },
                {
                  label: EnvironmentVariableScopeEnum.ENVIRONMENT.toString().toLowerCase(),
                  value: EnvironmentVariableScopeEnum.ENVIRONMENT,
                },
                {
                  label: EnvironmentVariableScopeEnum.APPLICATION.toString().toLowerCase(),
                  value: EnvironmentVariableScopeEnum.APPLICATION,
                },
              ]}
              onChange={field.onChange}
              value={field.value}
              label="Scope"
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button
            className="btn--no-min-w"
            style={ButtonStyle.STROKED}
            onClick={() => {
              props.setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button className="btn--no-min-w" type="submit" disabled={!props.formState.isValid}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CrudEnvironmentVariableModal

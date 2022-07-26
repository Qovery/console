/* eslint-disable-next-line */
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonStyle, InputSelectSmall, InputTextSmall, InputToggle } from '@console/shared/ui'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'

export interface ImportEnvironmentVariableModalProps {
  onSubmit: () => void
  keys?: string[]
  availableScopes: EnvironmentVariableScopeEnum[]
  setOpen: (b: boolean) => void
  loading: boolean
  triggerToggleAll: () => void
  toggleAll: boolean
  changeScopeForAll: (value: string | undefined) => void
}

export function ImportEnvironmentVariableModal(props: ImportEnvironmentVariableModalProps) {
  const { control, formState } = useFormContext()
  const { keys = [], loading = false, availableScopes = computeAvailableScope(undefined, true) } = props

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">Import variables</h2>

      <div className="flex items-center">
        <p className="">Preset all variables with scope</p>
        <InputSelectSmall
          dataTestId="select-scope-for-all"
          name="search"
          items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
          onChange={props.changeScopeForAll}
        />
        <span>and</span>
        <div className="flex items-center gap-3 mb-8">
          <InputToggle dataTestId="toggle-for-all" value={props.toggleAll} onChange={props.triggerToggleAll} />
          <p className="text-text-500 text-sm font-medium">Secret</p>
        </div>
      </div>

      <form onSubmit={props.onSubmit}>
        {keys?.map((key) => (
          <div key={key} data-testid="form-row">
            <Controller
              name={key + '_key'}
              control={control}
              rules={{
                required: 'Please enter a value.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="mb-6"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label={key + '_key'}
                />
              )}
            />

            <Controller
              name={key + '_value'}
              control={control}
              rules={{
                required: 'Please enter a value.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="mb-6"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                />
              )}
            />

            <Controller
              name={key + '_scope'}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputSelectSmall
                  data-testid="scope"
                  className="mb-6"
                  name={field.name}
                  items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
                />
              )}
            />

            <Controller
              name="isSecret"
              control={control}
              render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} />}
            />
          </div>
        ))}

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
          <Button className="btn--no-min-w" type="submit" disabled={!formState.isValid} loading={loading}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ImportEnvironmentVariableModal

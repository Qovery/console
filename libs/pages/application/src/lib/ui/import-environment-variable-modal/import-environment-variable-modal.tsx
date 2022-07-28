/* eslint-disable-next-line */
import { Controller, useFormContext } from 'react-hook-form'
import {
  Button,
  ButtonStyle,
  Dropzone,
  InputSelectSmall,
  InputTextSmall,
  InputToggle,
  WarningBox,
} from '@console/shared/ui'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'
import { DropzoneRootProps } from 'react-dropzone'

export interface ImportEnvironmentVariableModalProps {
  onSubmit: () => void
  keys?: string[]
  availableScopes: EnvironmentVariableScopeEnum[]
  setOpen: (b: boolean) => void
  loading: boolean
  triggerToggleAll: (b: boolean) => void
  toggleAll: boolean
  changeScopeForAll: (value: EnvironmentVariableScopeEnum | undefined) => void
  showDropzone: boolean
  dropzoneGetRootProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneGetInputProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneIsDragActive: boolean
}

const validateDoesNotBeginsWithQovery = (value: string) => {
  if (value.toLowerCase().startsWith('qovery')) {
    return 'Variable name cannot begin with "QOVERY"'
  }
  return true
}

export function ImportEnvironmentVariableModal(props: ImportEnvironmentVariableModalProps) {
  const { control, formState } = useFormContext()
  const { keys = [], loading = false, availableScopes = computeAvailableScope(undefined, true) } = props

  // write a regex pattern that rejects spaces
  const pattern = /^[^\s]+$/

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-6 max-w-sm">Import variables</h2>

      {props.showDropzone ? (
        <>
          <WarningBox
            className="mb-6"
            message="You are about to import environment variables into your environment. Please note that if you import a variable with the same name as an existing variable, it will be overwritten."
          />
          <div {...props.dropzoneGetRootProps({ className: 'dropzone' })} className="flex h-[200px]">
            <input data-testid="drop-input" {...props.dropzoneGetInputProps()} />
            <Dropzone isDragActive={props.dropzoneIsDragActive} />
          </div>
        </>
      ) : (
        <>
          <WarningBox
            className="mb-6"
            message="You are about to import environment variables into your environment. Please note that 3 variables with the same name as an existing variable and will be overwritten"
          />
          <div className="flex items-center bg-element-light-lighter-400 rounded-sm justify-between px-4 py-2 my-6">
            <p className="font-medium text-element-light-lighter-800 text-sm">Preset all variables with scope</p>
            <InputSelectSmall
              dataTestId="select-scope-for-all"
              name="search"
              items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
              onChange={(value?: string) => props.changeScopeForAll(value as EnvironmentVariableScopeEnum)}
            />
            <span className="font-medium text-element-light-lighter-800 text-sm">and</span>
            <div className="flex items-center gap-1">
              <InputToggle dataTestId="toggle-for-all" value={props.toggleAll} onChange={props.triggerToggleAll} />
              <p className="text-text-500 text-sm font-medium">Secret</p>
            </div>
          </div>

          <form onSubmit={props.onSubmit}>
            <div className="grid mb-3" style={{ gridTemplateColumns: '30% 30% 30% 10%' }}>
              <span className="text-xs text-text-600 font-medium">Variable</span>
              <span className="text-xs text-text-600 font-medium">Value</span>
              <span className="text-xs text-text-600 font-medium">Scope</span>
              <span className="text-xs text-text-600 font-medium">Secret</span>
            </div>
            {keys?.map((key) => (
              <div
                key={key}
                data-testid="form-row"
                className="grid mb-3"
                style={{ gridTemplateColumns: '30% 30% 30% 10%' }}
              >
                <Controller
                  name={key + '_key'}
                  control={control}
                  rules={{
                    required: 'Please enter a value.',
                    pattern: {
                      value: pattern,
                      message: 'Variable name cannot contain spaces.',
                    },
                    validate: validateDoesNotBeginsWithQovery,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextSmall
                      className="shrink-0 grow flex-1 mr-3"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      label={key + '_key'}
                      errorMessagePosition="left"
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
                      className="shrink-0 grow flex-1 mr-3"
                      data-testid="value"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      errorMessagePosition="left"
                    />
                  )}
                />

                <Controller
                  name={key + '_scope'}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectSmall
                      data-testid="scope"
                      className="shrink-0 grow flex-1 mr-3"
                      name={field.name}
                      defaultValue={field.value}
                      isValid={!error}
                      onChange={field.onChange}
                      items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
                    />
                  )}
                />

                <div className="flex items-center">
                  <Controller
                    name={key + '_secret'}
                    control={control}
                    render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} />}
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 justify-end mt-6">
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
        </>
      )}
    </div>
  )
}

export default ImportEnvironmentVariableModal

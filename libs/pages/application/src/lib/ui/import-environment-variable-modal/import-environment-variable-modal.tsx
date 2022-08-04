import { Controller, useFormContext } from 'react-hook-form'
import {
  Button,
  ButtonStyle,
  Dropzone,
  Icon,
  IconAwesomeEnum,
  InputSelectSmall,
  InputTextSmall,
  InputToggle,
} from '@console/shared/ui'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'
import { DropzoneRootProps } from 'react-dropzone'
import { EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
import { validateKey, warningMessage } from '../../feature/import-environment-variable-modal-feature/utils/form-check'

export interface ImportEnvironmentVariableModalProps {
  onSubmit: () => void
  keys?: string[]
  availableScopes: EnvironmentVariableScopeEnum[]
  closeModal: () => void
  loading: boolean
  triggerToggleAll: (b: boolean) => void
  toggleAll: boolean
  changeScopeForAll: (value: EnvironmentVariableScopeEnum | undefined) => void
  showDropzone: boolean
  dropzoneGetRootProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneGetInputProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneIsDragActive: boolean
  existingVars: EnvironmentVariableSecretOrPublic[]
  deleteKey: (key: string) => void
  overwriteEnabled: boolean
  setOverwriteEnabled: (b: boolean) => void
}

export function ImportEnvironmentVariableModal(props: ImportEnvironmentVariableModalProps) {
  const { control, formState, getValues, trigger } = useFormContext()
  const { keys = [], loading = false, availableScopes = computeAvailableScope(undefined, false) } = props

  // write a regex pattern that rejects spaces
  const pattern = /^[^\s]+$/

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-6 max-w-sm">Import variables</h2>

      {props.showDropzone ? (
        <>
          <div {...props.dropzoneGetRootProps({ className: 'dropzone' })}>
            <input data-testid="drop-input" {...props.dropzoneGetInputProps()} />
            <Dropzone isDragActive={props.dropzoneIsDragActive} />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <InputToggle
              dataTestId="overwrite-enabled"
              value={props.overwriteEnabled}
              onChange={props.setOverwriteEnabled}
              title="Enable overwrite"
              description="If enabled, existing variables will be overwritten."
            />
          </div>

          <form onSubmit={props.onSubmit}>
            <div className="grid mb-3" style={{ gridTemplateColumns: '6fr 6fr 204px 2fr 1fr' }}>
              <span className="text-xs text-text-600 font-medium">Variable</span>
              <span className="text-xs text-text-600 font-medium">Value</span>
              <span className="text-xs text-text-600 font-medium">Scope</span>
              <span className="text-xs text-text-600 font-medium">Secret</span>
            </div>

            <div className="flex items-center bg-element-light-lighter-400 rounded-sm justify-between px-4 py-2 mb-3">
              <p className="font-medium text-element-light-lighter-800 text-sm">Apply for all</p>
              <div className="flex gap-4">
                <InputSelectSmall
                  className="w-[188px]"
                  dataTestId="select-scope-for-all"
                  name="search"
                  items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
                  onChange={(value?: string) => {
                    props.changeScopeForAll(value as EnvironmentVariableScopeEnum)
                    trigger().then()
                  }}
                />
                <div className="flex items-center mr-6">
                  <InputToggle dataTestId="toggle-for-all" value={props.toggleAll} onChange={props.triggerToggleAll} />
                </div>
              </div>
            </div>
            {keys?.map((key) => (
              <div
                key={key}
                data-testid="form-row"
                className="grid mb-3"
                style={{ gridTemplateColumns: '6fr 6fr 204px 2fr 1fr' }}
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
                    validate: (value) =>
                      validateKey(value, props.existingVars, getValues(key + '_scope') as EnvironmentVariableScopeEnum),
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextSmall
                      className="shrink-0 grow flex-1 mr-3"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      warning={warningMessage(
                        field.value,
                        props.existingVars,
                        getValues(key + '_scope') as EnvironmentVariableScopeEnum,
                        props.overwriteEnabled
                      )}
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
                      className="w-[188px]"
                      name={field.name}
                      defaultValue={field.value}
                      isValid={!error}
                      onChange={(e) => {
                        field.onChange(e)
                        trigger(key + '_key').then()
                      }}
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

                <div className="flex items-center h-full w-full grow">
                  <button
                    className="btn-icon-action justify-center items-center w-full"
                    onClick={() => props.deleteKey(key)}
                  >
                    <Icon className="text-xs text-text-400" name={IconAwesomeEnum.CROSS} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3 justify-end mt-6">
              <Button
                className="btn--no-min-w"
                style={ButtonStyle.STROKED}
                onClick={() => {
                  props.closeModal()
                }}
              >
                Cancel
              </Button>
              <Button
                dataTestId="submit-button"
                className="btn--no-min-w"
                type="submit"
                disabled={!formState.isValid}
                loading={loading}
              >
                Import
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default ImportEnvironmentVariableModal

import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { DropzoneRootProps } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  ButtonStyle,
  Dropzone,
  IconAwesomeEnum,
  InputSelectSmall,
  InputTextSmall,
  InputToggle,
} from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/utils'
import { validateKey, warningMessage } from '../../feature/import-environment-variable-modal-feature/utils/form-check'

export interface ImportEnvironmentVariableModalProps {
  onSubmit: () => void
  keys?: string[]
  availableScopes: APIVariableScopeEnum[]
  closeModal: () => void
  loading: boolean
  triggerToggleAll: (b: boolean) => void
  toggleAll: boolean
  changeScopeForAll: (value: APIVariableScopeEnum | undefined) => void
  showDropzone: boolean
  dropzoneGetRootProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneGetInputProps: <T extends DropzoneRootProps>(props?: T) => T
  dropzoneIsDragActive: boolean
  existingVars: EnvironmentVariableSecretOrPublic[]
  deleteKey: (key: string) => void
  overwriteEnabled: boolean
  setOverwriteEnabled: (b: boolean) => void
  serviceType?: ServiceTypeEnum
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
        <div {...props.dropzoneGetRootProps({ className: 'dropzone' })}>
          <input data-testid="drop-input" {...props.dropzoneGetInputProps()} />
          <Dropzone isDragActive={props.dropzoneIsDragActive} />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <InputToggle
              dataTestId="overwrite-enabled"
              small
              value={props.overwriteEnabled}
              onChange={props.setOverwriteEnabled}
              title="Enable overwrite"
              description="If enabled, existing variables will be overwritten."
            />
          </div>

          <form onSubmit={props.onSubmit}>
            <div className="grid mb-3" style={{ gridTemplateColumns: '6fr 6fr 204px 2fr 1fr' }}>
              <span className="text-sm text-text-600 font-medium">Variable</span>
              <span className="text-sm text-text-600 font-medium">Value</span>
              <span className="text-sm text-text-600 font-medium">Scope</span>
              <span className="text-sm text-text-600 font-medium pl-1.5">Secret</span>
            </div>

            <div className="flex items-center bg-element-light-lighter-400 rounded justify-between px-4 py-2 mb-3">
              <p className="font-medium text-text-600 text-ssm">Apply for all</p>
              <div className="flex gap-4">
                <InputSelectSmall
                  className="w-[188px]"
                  dataTestId="select-scope-for-all"
                  name="search"
                  items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
                  onChange={(value?: string) => {
                    props.changeScopeForAll(value as APIVariableScopeEnum)
                    trigger().then()
                  }}
                />
                <div className="flex items-center justify-center mr-6 w-14 ml-1">
                  <InputToggle
                    dataTestId="toggle-for-all"
                    small
                    value={props.toggleAll}
                    onChange={props.triggerToggleAll}
                  />
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
                      validateKey(value, props.existingVars, getValues(key + '_scope') as APIVariableScopeEnum),
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
                        getValues(key + '_scope') as APIVariableScopeEnum,
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
                      type="password"
                      hasShowPasswordButton={true}
                    />
                  )}
                />

                <Controller
                  name={key + '_scope'}
                  control={control}
                  render={({ field }) => (
                    <InputSelectSmall
                      data-testid="scope"
                      className="w-[188px]"
                      name={field.name}
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e)
                        trigger(key + '_key').then()
                      }}
                      items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
                    />
                  )}
                />

                <div className="flex items-center justify-center w-14 ml-1">
                  <Controller
                    name={key + '_secret'}
                    control={control}
                    render={({ field }) => <InputToggle small value={field.value} onChange={field.onChange} />}
                  />
                </div>

                <div className="flex items-center h-full w-full grow">
                  <ButtonIcon
                    icon={IconAwesomeEnum.CROSS}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonSize.TINY}
                    onClick={() => props.deleteKey(key)}
                    className="text-text-400 hover:text-text-500 !w-8 !h-8"
                    iconClassName="!text-xs"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 justify-end mt-6">
              <Button
                className="btn--no-min-w"
                style={ButtonStyle.STROKED}
                size={ButtonSize.XLARGE}
                onClick={() => props.closeModal()}
              >
                Cancel
              </Button>
              <Button
                dataTestId="submit-button"
                className="btn--no-min-w"
                type="submit"
                size={ButtonSize.XLARGE}
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

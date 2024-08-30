import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type DropzoneRootProps } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { Button, Dropzone, Icon, InputSelectSmall, InputTextSmall, InputToggle } from '@qovery/shared/ui'
import { computeAvailableScope, generateScopeLabel } from '@qovery/shared/util-js'
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
  serviceType?: ServiceType
}

export function ImportEnvironmentVariableModal(props: ImportEnvironmentVariableModalProps) {
  const { control, formState, getValues, trigger } = useFormContext()
  const { keys = [], loading = false, availableScopes = computeAvailableScope(undefined, false) } = props
  const [localScope, setLocalScope] = useState<APIVariableScopeEnum>(APIVariableScopeEnum.ENVIRONMENT)

  // write a regex pattern that rejects spaces
  const pattern = /^[^\s]+$/

  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm text-neutral-400">Import variables from .env file</h2>

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
            <div className="mb-3 grid" style={{ gridTemplateColumns: '6fr 6fr 204px 2fr 1fr' }}>
              <span className="text-sm font-medium text-neutral-400">Variable</span>
              <span className="text-sm font-medium text-neutral-400">Value</span>
              <span className="text-sm font-medium text-neutral-400">Scope</span>
              <span className="pl-1.5 text-sm font-medium text-neutral-400">Secret</span>
            </div>

            <div className="mb-3 flex items-center justify-between rounded bg-neutral-200 px-4 py-2">
              <p className="text-ssm font-medium text-neutral-400">Apply for all</p>
              <div className="flex gap-4">
                <InputSelectSmall
                  className="w-32"
                  inputClassName="font-normal bg-white"
                  dataTestId="select-scope-for-all"
                  name="search"
                  defaultValue={localScope}
                  items={availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
                  onChange={(value?: string) => {
                    props.changeScopeForAll(value as APIVariableScopeEnum)
                    setLocalScope(value as APIVariableScopeEnum)
                    trigger().then()
                  }}
                />
                <div className="ml-1 mr-6 flex w-14 items-center justify-center">
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
                className="mb-3 grid"
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
                      className="mr-3 flex-1 shrink-0 grow"
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
                      className="mr-3 flex-1 shrink-0 grow"
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
                      items={availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
                    />
                  )}
                />

                <div className="ml-1 flex w-14 items-center justify-center">
                  <Controller
                    name={key + '_secret'}
                    control={control}
                    render={({ field }) => <InputToggle small value={field.value} onChange={field.onChange} />}
                  />
                </div>

                <div className="flex h-full w-full grow items-center">
                  <Button type="button" variant="plain" size="md" onClick={() => props.deleteKey(key)}>
                    <Icon className="text-base" iconName="trash-can" iconStyle="regular" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => props.closeModal()}>
                Cancel
              </Button>
              <Button
                data-testid="submit-button"
                type="submit"
                size="lg"
                variant="solid"
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

import { APIVariableScopeEnum, type ServiceTypeForVariableEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { type DropzoneRootProps, useDropzone } from 'react-dropzone'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { Button, Dropzone, Icon, InputSelectSmall, InputTextSmall, InputToggle, useModal } from '@qovery/shared/ui'
import { computeAvailableScope, generateScopeLabel, parseEnvText } from '@qovery/shared/util-js'
import { useImportVariables } from '../hooks/use-import-variables/use-import-variables'
import { useVariables } from '../hooks/use-variables/use-variables'
import { changeScopeForAll } from './utils/change-scope-all'
import { deleteEntry } from './utils/delete-entry'
import { parsedToForm } from './utils/file-to-form'
import { validateKey, warningMessage } from './utils/form-check'
import { formatData } from './utils/handle-submit'
import { onDrop } from './utils/on-drop'
import { triggerToggleAll } from './utils/trigger-toggle-all'

type Scope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

export type ImportEnvironmentVariableModalFeatureProps = {
  closeModal: () => void
  serviceType?: ServiceType
} & (
  | {
      scope: Extract<Scope, 'PROJECT'>
      projectId: string
    }
  | {
      scope: Extract<Scope, 'ENVIRONMENT'>
      projectId: string
      environmentId: string
    }
  | {
      scope: Exclude<Scope, 'PROJECT' | 'ENVIRONMENT'>
      projectId: string
      environmentId: string
      serviceId: string
    }
)

export interface ImportEnvironmentVariableModalProps {
  onSubmit: () => void
  keys?: string[]
  availableScopes: APIVariableScopeEnum[]
  defaultScope: APIVariableScopeEnum
  scopeTarget?: keyof typeof APIVariableScopeEnum | ServiceType
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
}

export function ImportEnvironmentVariableModal(props: ImportEnvironmentVariableModalProps) {
  const { control, formState, getValues, trigger } = useFormContext()
  const { keys = [], loading = false, availableScopes = computeAvailableScope(undefined, false) } = props
  const [localScope, setLocalScope] = useState<APIVariableScopeEnum>(props.defaultScope)

  // write a regex pattern that rejects spaces
  const pattern = /^[^\s]+$/

  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm text-neutral">Import variables from .env file</h2>

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
              <span className="text-sm font-medium text-neutral">Variable</span>
              <span className="text-sm font-medium text-neutral">Value</span>
              <span className="text-sm font-medium text-neutral">Scope</span>
              <span className="pl-1.5 text-sm font-medium text-neutral">Secret</span>
            </div>

            <div className="mb-3 flex items-center justify-between rounded bg-surface-neutral-subtle px-4 py-2">
              <p className="text-ssm font-medium text-neutral">Apply for all</p>
              <div className="flex gap-4">
                <InputSelectSmall
                  className="w-32"
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
                      validateKey(
                        value,
                        props.existingVars,
                        getValues(key + '_scope') as APIVariableScopeEnum,
                        props.scopeTarget
                      ),
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
                        props.overwriteEnabled,
                        props.scopeTarget
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

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ mode: 'all' })
  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])
  const [overwriteEnabled, setOverwriteEnabled] = useState<boolean>(false)

  const { enableAlertClickOutside } = useModal()

  const scope = props.scope

  const parentId =
    props.scope === 'PROJECT' ? props.projectId : props.scope === 'ENVIRONMENT' ? props.environmentId : props.serviceId

  const availableScopes = computeAvailableScope(APIVariableScopeEnum.PROJECT, false, scope)
  const preferredScope =
    scope === APIVariableScopeEnum.PROJECT ? APIVariableScopeEnum.PROJECT : APIVariableScopeEnum.ENVIRONMENT
  const defaultScope = availableScopes.includes(preferredScope) ? preferredScope : availableScopes[0] ?? preferredScope

  const scopeTarget = scope === 'PROJECT' || scope === 'ENVIRONMENT' ? scope : props.serviceType ?? scope

  const { data: existingEnvVars = [], isLoading } = useVariables({
    parentId,
    scope,
  })

  const handleData = useCallback(
    async (data: string) => {
      const parsed = parseEnvText(data)
      if (parsed) {
        const fileParsedd = parsedToForm(parsed, defaultScope)
        setFileParsed(fileParsedd)
        methods.reset(fileParsedd, { keepErrors: true, keepDirtyValues: true })
        setKeys(Object.keys(parsed))
      }
    },
    [setFileParsed, setKeys, defaultScope, methods]
  )

  useEffect(() => {
    methods.trigger()
  }, [fileParsed, methods])

  useEffect(() => {
    if (fileParsed) enableAlertClickOutside(true)
  }, [fileParsed, enableAlertClickOutside])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, handleData),
  })

  const { mutateAsync: importVariables, isLoading: isImportVariablesLoading } = useImportVariables()

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal
        toggleAll={false}
        triggerToggleAll={(b) => triggerToggleAll(b, methods.setValue, keys)}
        changeScopeForAll={(scope) => changeScopeForAll(scope as APIVariableScopeEnum, methods.setValue, keys)}
        keys={keys}
        closeModal={props.closeModal}
        loading={isLoading || isImportVariablesLoading}
        availableScopes={availableScopes}
        defaultScope={defaultScope}
        scopeTarget={scopeTarget}
        onSubmit={methods.handleSubmit(async () => {
          if (!scope) {
            return
          }
          const vars = formatData(methods.getValues(), keys)
          await importVariables({
            serviceType: scope as unknown as ServiceTypeForVariableEnum,
            serviceId: parentId,
            variableImportRequest: {
              overwrite: overwriteEnabled,
              vars,
            },
          })
          props.closeModal()
        })}
        showDropzone={!fileParsed}
        dropzoneGetInputProps={getInputProps}
        dropzoneGetRootProps={getRootProps}
        dropzoneIsDragActive={isDragActive}
        existingVars={existingEnvVars}
        deleteKey={(key) => {
          deleteEntry(key, setKeys, keys, methods.unregister)
        }}
        overwriteEnabled={overwriteEnabled}
        setOverwriteEnabled={setOverwriteEnabled}
      />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature

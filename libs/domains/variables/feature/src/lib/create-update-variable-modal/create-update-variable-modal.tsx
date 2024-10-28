import { type APIVariableScopeEnum, type APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  Button,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  ModalCrud,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import {
  computeAvailableScope,
  environmentVariableFile,
  generateScopeLabel,
  getEnvironmentVariableFileMountPath,
} from '@qovery/shared/util-js'
import DropdownVariable from '../dropdown-variable/dropdown-variable'
import { useCreateVariableAlias } from '../hooks/use-create-variable-alias/use-create-variable-alias'
import { useCreateVariableOverride } from '../hooks/use-create-variable-override/use-create-variable-override'
import { useCreateVariable } from '../hooks/use-create-variable/use-create-variable'
import { useEditVariable } from '../hooks/use-edit-variable/use-edit-variable'

type Scope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

export type CreateUpdateVariableModalProps = {
  closeModal: () => void
  onSubmit?: (variable?: VariableResponse | void) => void
  variable?: VariableResponse
  mode: 'CREATE' | 'UPDATE'
  type: keyof typeof APIVariableTypeEnum
  isFile?: boolean
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

export function CreateUpdateVariableModal(props: CreateUpdateVariableModalProps) {
  const { scope, closeModal, onSubmit, variable, mode, type, isFile } = props
  const _isFile = (variable && environmentVariableFile(variable)) || (isFile ?? false)
  const { enableAlertClickOutside } = useModal()
  const [loading, setLoading] = useState(false)

  const { mutateAsync: createVariable } = useCreateVariable()
  const { mutateAsync: createVariableAlias } = useCreateVariableAlias()
  const { mutateAsync: createVariableOverride } = useCreateVariableOverride()
  const { mutateAsync: editVariable } = useEditVariable()

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleInsertVariable = ({
    variableKey,
    value,
    onChange,
  }: {
    variableKey: string
    value: string
    onChange: (value: string) => void
  }) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const startPos = textarea.selectionStart ?? 0
    const endPos = textarea.selectionEnd ?? 0

    const newValue = value.substring(0, startPos) + `{{${variableKey}}}` + value.substring(endPos)

    onChange(newValue)
    // setTimeout is required to refocus the textarea after a potential re-render caused by the value update.
    setTimeout(() => textarea?.focus(), 50)
  }

  const availableScopes = computeAvailableScope(variable?.scope, false, scope, type === 'OVERRIDE') as Scope[]

  const defaultScope =
    variable?.scope === 'BUILT_IN'
      ? undefined
      : mode === 'CREATE' && type === 'OVERRIDE'
        ? availableScopes[0]
        : variable?.scope
          ? variable.scope
          : availableScopes[availableScopes.length - 1]
  const mountPath = getEnvironmentVariableFileMountPath(variable)

  const methods = useForm<{
    key: string
    value?: string | null
    description?: string
    scope: Scope
    isSecret: boolean
    enable_interpolation_in_file?: boolean
    mountPath?: string
  }>({
    defaultValues: {
      key: variable?.key,
      scope: defaultScope,
      value: variable?.value,
      isSecret: variable?.is_secret,
      description: variable?.description,
      enable_interpolation_in_file: _isFile ? variable?.enable_interpolation_in_file ?? true : undefined,
      mountPath,
    },
    mode: 'onChange',
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const _onSubmit = methods.handleSubmit(async (data) => {
    const cloneData = { ...data }

    // allow empty variable value
    if (!cloneData.value) cloneData.value = ''

    if (!_isFile) {
      delete cloneData.mountPath
    }

    try {
      setLoading(true)

      const parentId = match(data)
        .with({ scope: 'PROJECT' }, () => props.projectId)
        .with({ scope: 'ENVIRONMENT' }, () => {
          if ('environmentId' in props) {
            return props.environmentId
          }
          throw new Error('Scope mismatch')
        })
        .with({ scope: 'APPLICATION' }, { scope: 'CONTAINER' }, { scope: 'JOB' }, { scope: 'HELM' }, () => {
          if ('serviceId' in props) {
            return props.serviceId
          }
          throw new Error('Scope mismatch')
        })
        .with({ scope: undefined }, () => {
          throw new Error('scope undefined')
        })
        .exhaustive()

      const result = await match(props)
        .with({ mode: 'CREATE', type: 'VALUE' }, () =>
          createVariable({
            variableRequest: {
              is_secret: data.isSecret,
              key: data.key,
              value: data.value || '',
              description: data.description,
              mount_path: data.mountPath || null,
              variable_parent_id: parentId,
              variable_scope: data.scope,
              enable_interpolation_in_file: data.enable_interpolation_in_file,
            },
          })
        )
        .with({ mode: 'CREATE', type: 'ALIAS' }, () => {
          if (!variable) {
            throw new Error('No variable to be based on')
          }
          return createVariableAlias({
            variableId: variable.id,
            variableAliasRequest: {
              alias_scope: data.scope,
              alias_parent_id: parentId,
              key: data.key,
              description: data.description,
              enable_interpolation_in_file: data.enable_interpolation_in_file ?? false,
            },
          })
        })
        .with({ mode: 'CREATE', type: 'OVERRIDE' }, () => {
          if (!variable) {
            throw new Error('No variable to be based on')
          }
          return createVariableOverride({
            variableId: variable.id,
            variableOverrideRequest: {
              override_scope: data.scope,
              override_parent_id: parentId,
              value: data.value || '',
              description: data.description,
              enable_interpolation_in_file: data.enable_interpolation_in_file ?? false,
            },
          })
        })
        .with({ mode: 'CREATE', type: 'FILE' }, { mode: 'CREATE', type: 'BUILT_IN' }, () => {
          return Promise.resolve()
        })
        .with({ mode: 'UPDATE' }, () => {
          if (!variable) {
            throw new Error('No variable to be based on')
          }

          // Allowing a null value for the variable when updating permits retaining the current value.
          // For newly created variables, a value is required and an empty string will be set if not provided.
          return editVariable({
            variableId: variable.id,
            variableEditRequest: {
              key: data.key,
              value: variable.aliased_variable?.key || data.value,
              description: data.description,
              enable_interpolation_in_file: data.enable_interpolation_in_file ?? false,
            },
          })
        })
        .exhaustive()

      onSubmit?.(result)

      closeModal()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  })

  let title = ''
  if (mode === 'CREATE' && type === 'VALUE') {
    title = 'New'
  } else if (mode === 'UPDATE') {
    title = 'Edit ' + (type === 'ALIAS' ? 'alias' : type === 'OVERRIDE' ? 'override' : '')
  } else if (mode === 'CREATE') {
    title = 'Create ' + (type === 'ALIAS' ? 'alias' : type === 'OVERRIDE' ? 'override' : '')
  }

  title += ' variable' + (_isFile ? ' file' : '')

  const description = match({ type, _isFile })
    .with({ type: 'ALIAS' }, () => 'Aliases allow you to specify a different name for a variable on a specific scope.')
    .with({ type: 'OVERRIDE' }, () => 'Overrides allow you to define a different env var value on a specific scope.')
    .with(
      { _isFile: true },
      () =>
        'The content of the Value field will be mounted as a file in the specified "Path". Accessing the environment variable at runtime will return the "Path" of the file.'
    )
    .otherwise(
      () =>
        'Variable are used at build/run time. Secrets are special variables, their value can only be accessed by the application.'
    )

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={title}
        description={description}
        submitLabel="Confirm"
        onClose={closeModal}
        onSubmit={_onSubmit}
        loading={loading}
      >
        {type === 'ALIAS' || type === 'OVERRIDE' ? (
          <InputText className="mb-3" name="Variable" value={variable?.key} label="Variable" disabled />
        ) : (
          <Controller
            name="key"
            control={methods.control}
            rules={{
              required: 'Please enter a variable key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-3"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Variable"
                error={error?.message}
              />
            )}
          />
        )}

        {_isFile &&
          (type === 'ALIAS' || type === 'OVERRIDE' || mode === 'UPDATE' ? (
            <InputText className="mb-3" name="Path" value={mountPath} label="Path" disabled />
          ) : (
            <Controller
              name="mountPath"
              control={methods.control}
              rules={{
                required: 'Please enter a mount path.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Path"
                  error={error?.message}
                />
              )}
            />
          ))}

        {type === 'ALIAS' && (
          <div>
            <div className="mb-3 flex items-center">
              <Icon
                iconName="arrow-turn-down-right"
                iconStyle="regular"
                className="ml-1 mr-2 text-2xs text-neutral-300"
              />
              <span className="mr-3 inline-flex h-4 items-center rounded-sm bg-teal-500 px-1 text-2xs font-bold text-neutral-50">
                ALIAS
              </span>
            </div>

            <Controller
              name="key"
              control={methods.control}
              rules={{
                required: 'Please enter a variable key.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="New variable"
                  error={error?.message}
                />
              )}
            />
          </div>
        )}

        {type === 'OVERRIDE' && (
          <div className="mb-3 flex items-center">
            <Icon
              iconName="arrow-turn-down-right"
              iconStyle="regular"
              className="ml-1 mr-2 text-2xs text-neutral-300"
            />
            <span className="mr-3 inline-flex h-4 items-center rounded-sm bg-brand-500 px-1 text-2xs font-bold text-neutral-50">
              OVERRIDE
            </span>
          </div>
        )}

        {(type === 'VALUE' || type === 'FILE' || type === 'OVERRIDE') && (
          <Controller
            name="value"
            control={methods.control}
            render={({ field: { name, onChange, value }, fieldState: { error } }) => (
              <div className="relative">
                <InputTextArea
                  ref={textareaRef}
                  className="mb-3"
                  name={name}
                  onChange={onChange}
                  value={value}
                  label="Value"
                  error={error?.message}
                />
                {'environmentId' in props && (
                  <DropdownVariable
                    environmentId={props.environmentId}
                    onChange={(variableKey) => handleInsertVariable({ variableKey, value: value || '', onChange })}
                  >
                    <Button
                      size="md"
                      type="button"
                      color="neutral"
                      variant="surface"
                      className="absolute bottom-1.5 right-1.5 w-9 justify-center"
                    >
                      <Icon className="text-sm" iconName="wand-magic-sparkles" />
                    </Button>
                  </DropdownVariable>
                )}
              </div>
            )}
          />
        )}

        {_isFile && (
          <Controller
            name="enable_interpolation_in_file"
            control={methods.control}
            render={({ field }) => (
              <InputToggle
                small
                forceAlignTop
                className="mb-3 mt-5"
                value={field.value}
                onChange={field.onChange}
                title="Variable interpolation"
                description="Enable the variable interpolation feature within the file content. Use {{<var_name>}} to access the variable value."
              />
            )}
          />
        )}

        <Controller
          name="scope"
          control={methods.control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field }) =>
            mode === 'UPDATE' ? (
              <InputText
                className="mb-3"
                name="Scope"
                value={generateScopeLabel(field.value)}
                label="Scope"
                rightElement={
                  <Tooltip content="Scope can't be changed. Re-create the var with the right scope." side="left">
                    <div>
                      <Icon iconName="circle-info" className="text-sm text-neutral-350" />
                    </div>
                  </Tooltip>
                }
                disabled
              />
            ) : (
              <InputSelect
                className="mb-4"
                portal
                options={availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
                onChange={field.onChange}
                value={field.value}
                label="Scope"
              />
            )
          }
        />

        {mode === 'CREATE' && type === 'VALUE' && (
          <div className="mb-8 flex items-center gap-3">
            <Controller
              name="isSecret"
              control={methods.control}
              render={({ field }) => (
                <InputToggle
                  small
                  value={field.value}
                  onChange={field.onChange}
                  title={`Secret ${_isFile ? 'file' : 'variable'}`}
                />
              )}
            />
          </div>
        )}

        <Controller
          name="description"
          control={methods.control}
          rules={{
            maxLength: {
              value: 255,
              message: 'Description must be less than 255 characters.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Description (optional)"
              error={error?.message}
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateUpdateVariableModal

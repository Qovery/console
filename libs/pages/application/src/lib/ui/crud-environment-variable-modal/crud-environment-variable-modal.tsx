import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import {
  Button,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  Tooltip,
} from '@qovery/shared/ui'
import { generateScopeLabel } from '@qovery/shared/util-js'
import {
  type DataFormEnvironmentVariableInterface,
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
  parentVariableName?: string
  isFile?: boolean
}

export function CrudEnvironmentVariableModal(props: CrudEnvironmentVariableModalProps) {
  const { control, formState, getValues } = useFormContext<DataFormEnvironmentVariableInterface>()

  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400 mb-2 max-w-sm">{props.title}</h2>
      <p className="text-neutral-350 text-sm mb-6">{props.description}</p>
      <form onSubmit={props.onSubmit}>
        {props.type === EnvironmentVariableType.ALIAS || props.type === EnvironmentVariableType.OVERRIDE ? (
          <InputText className="mb-3" name="Variable" value={props.parentVariableName} label="Variable" disabled />
        ) : (
          <Controller
            name="key"
            control={control}
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
                disabled={props.type === EnvironmentVariableType.OVERRIDE}
              />
            )}
          />
        )}

        {props.isFile &&
          (props.type === EnvironmentVariableType.ALIAS ||
          props.type === EnvironmentVariableType.OVERRIDE ||
          props.mode === EnvironmentVariableCrudMode.EDITION ? (
            <InputText className="mb-3" name="Path" value={getValues().mountPath} label="Path" disabled />
          ) : (
            <Controller
              name="mountPath"
              control={control}
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

        {props.type === EnvironmentVariableType.ALIAS && (
          <div>
            <div className="flex items-center mb-3">
              <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
              <span className="bg-teal-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-3">
                ALIAS
              </span>
            </div>

            <Controller
              name="key"
              control={control}
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
                  disabled={props.type === EnvironmentVariableType.OVERRIDE}
                />
              )}
            />
          </div>
        )}

        {props.type === EnvironmentVariableType.OVERRIDE && (
          <div className="flex items-center mb-3">
            <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
            <span className="bg-brand-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-3">
              OVERRIDE
            </span>
          </div>
        )}

        {(props.type === EnvironmentVariableType.NORMAL || props.type === EnvironmentVariableType.OVERRIDE) && (
          <Controller
            name="value"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputTextArea
                className="mb-3"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Value"
                error={error?.message}
                disabled={props.type === EnvironmentVariableType.ALIAS}
              />
            )}
          />
        )}

        <Controller
          name="scope"
          control={control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field }) =>
            props.mode === EnvironmentVariableCrudMode.EDITION ? (
              <InputText
                className="mb-3"
                name="Scope"
                value={generateScopeLabel(field.value as APIVariableScopeEnum)}
                label="Scope"
                rightElement={
                  <Tooltip content="Scope can’t be changed. Re-create the var with the right scope." side="left">
                    <div>
                      <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350 text-sm" />
                    </div>
                  </Tooltip>
                }
                disabled
              />
            ) : (
              <InputSelect
                className="mb-4"
                portal
                options={props.availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
                onChange={field.onChange}
                value={field.value}
                label="Scope"
              />
            )
          }
        />

        {props.mode === EnvironmentVariableCrudMode.CREATION && props.type === EnvironmentVariableType.NORMAL && (
          <div className="flex items-center gap-3 mb-8">
            <Controller
              name="isSecret"
              control={control}
              render={({ field }) => (
                <InputToggle
                  small
                  value={field.value}
                  onChange={field.onChange}
                  title={`Secret ${props.isFile ? 'file' : 'variable'}`}
                />
              )}
            />
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

import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { BlockContent, Button, Icon, InputSelectSmall, InputTextSmall, InputToggle, Tooltip } from '@qovery/shared/ui'
import { generateScopeLabel } from '@qovery/shared/util-js'
import { CodeEditorVariable } from '../../code-editor-variable/code-editor-variable'
import { FieldVariableSuggestion } from '../../field-variable-suggestion/field-variable-suggestion'

export interface VariableRowProps {
  index: number
  onDelete: (index: number) => void
  availableScopes: APIVariableScopeEnum[]
  gridTemplateColumns?: string
}

export function VariableRow(props: VariableRowProps) {
  const { index, availableScopes, gridTemplateColumns = '172px 172px 188px 2fr 1fr' } = props
  const { control, trigger, watch } = useFormContext<FlowVariableData>()
  const [openEditor, setOpenEditor] = useState(true)
  const watchSecret = watch().variables[index]?.isSecret
  const watchReadOnly = watch().variables[index]?.isReadOnly
  const watchFile = watch().variables[index]?.file
  const watchDescription = watch().variables[index]?.description
  const { environmentId = '' } = useParams()

  const patternNoSpaces = /^[^\s]+$/
  const patternValidVariable = /^[a-zA-Z_][a-zA-Z0-9_]*$/

  return (
    <div data-testid="variable-row" className="mb-3 w-full items-center">
      <div key={index} data-testid="form-row" className="mb-3 grid max-w-full gap-3" style={{ gridTemplateColumns }}>
        <Controller
          name={`variables.${index}.variable`}
          control={control}
          rules={{
            required: 'Please enter a value.',
            validate: (value) => {
              if (!value) return true

              if (!patternNoSpaces.test(value)) {
                return 'Variable name cannot contain spaces.'
              }
              if (!patternValidVariable.test(value)) {
                return 'Variable name must start with a letter or underscore, and contain only letters, numbers, and underscores.'
              }
              return true
            },
          }}
          render={({ field, fieldState: { error } }) =>
            watchReadOnly ? (
              <Tooltip content={field.value}>
                <div className="flex items-center justify-between truncate rounded border border-neutral-200 bg-neutral-100 px-2 text-sm text-neutral-350">
                  <span className="max-w-full truncate">{field.value}</span>
                  {watchDescription && (
                    <Tooltip content={watchDescription}>
                      <span>
                        <Icon className="text-neutral-400" iconName="info-circle" iconStyle="regular" />
                      </span>
                    </Tooltip>
                  )}
                </div>
              </Tooltip>
            ) : (
              <InputTextSmall
                className="flex-1 shrink-0 grow"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                label="Variable"
                errorMessagePosition="left"
              />
            )
          }
        />

        {watchFile ? (
          <Button
            size="md"
            color="neutral"
            variant="surface"
            type="button"
            className="h-[36px] flex-1 shrink-0 grow justify-between"
            onClick={() => setOpenEditor((open) => !open)}
          >
            {openEditor ? (
              <>
                Close
                <Icon iconName="angle-up" className="text-neutral-400" />
              </>
            ) : (
              <>
                Edit
                <Icon iconName="edit" className="text-neutral-400" />
              </>
            )}
          </Button>
        ) : (
          <Controller
            name={`variables.${index}.value`}
            control={control}
            rules={{
              required: 'Please enter a value.',
            }}
            render={({ field, fieldState: { error } }) => (
              <FieldVariableSuggestion
                value={field.value}
                environmentId={environmentId}
                onChange={field.onChange}
                inputProps={{
                  className: 'w-full',
                  dataTestId: 'value',
                  name: field.name,
                  onChange: field.onChange,
                  value: field.value,
                  error: error?.message,
                  errorMessagePosition: 'left',
                  type: watchSecret ? 'password' : 'text',
                  hasShowPasswordButton: watchSecret,
                }}
              />
            )}
          />
        )}

        <Controller
          name={`variables.${index}.scope`}
          control={control}
          render={({ field }) => (
            <InputSelectSmall
              data-testid="scope"
              className="w-[188px]"
              name={field.name}
              defaultValue={field.value}
              onChange={(e) => {
                field.onChange(e)
                trigger(`variables.${index}.value`).then()
              }}
              items={availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
            />
          )}
        />

        <div className="flex w-14 items-center justify-center">
          <Controller
            name={`variables.${index}.isSecret`}
            control={control}
            render={({ field }) => <InputToggle small value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex h-full w-full grow items-center">
          <Button type="button" variant="plain" size="md" onClick={() => props.onDelete(index)}>
            <Icon className="text-base" iconName="trash-can" iconStyle="regular" />
          </Button>
        </div>
      </div>
      {watchFile && openEditor && (
        <BlockContent title={watchFile.path} classNameContent="p-0">
          <Controller
            name={`variables.${index}.value`}
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <CodeEditorVariable
                environmentId={environmentId}
                language="json"
                height="496px"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </BlockContent>
      )}
    </div>
  )
}

export default VariableRow

import { type HelmRequestAllOfSource, type TerraformVarKeyValue } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import {
  Controller,
  type UseFieldArrayRemove,
  type UseFormReturn,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { FieldVariableSuggestion } from '@qovery/domains/variables/feature'
import { Button, Heading, Icon, InputText, InputTextSmall, InputToggle, Section } from '@qovery/shared/ui'

export interface TerraformValuesArgumentsData {
  tf_var_file_paths: string[]
  tf_vars: TerraformVarKeyValue[]
}

export interface ValuesOverrideArgumentsSettingProps extends PropsWithChildren {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<TerraformValuesArgumentsData>
  onSubmit: () => void
}

function VarRow({ index, remove }: { index: number; remove: UseFieldArrayRemove }) {
  const { environmentId = '' } = useParams()
  const { control } = useFormContext()

  return (
    <li className="mb-3 last:mb-0">
      <div className="grid grid-cols-[6fr_6fr_32px_39px] items-center gap-x-3">
        <Controller
          name={`tf_vars.${index}.key`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall name={field.name} value={field.value} onChange={field.onChange} error={error?.message} />
          )}
        />

        <Controller
          name={`tf_vars.${index}.value`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <FieldVariableSuggestion
              value={field.value}
              environmentId={environmentId}
              onChange={field.onChange}
              inputProps={{
                className: 'w-full',
                name: field.name,
                onChange: field.onChange,
                value: field.value,
                error: error?.message,
              }}
            />
          )}
        />

        <Controller
          name={`tf_vars.${index}.secret`}
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-center">
              <InputToggle value={field.value} onChange={field.onChange} forceAlignTop small />
            </div>
          )}
        />

        <div>
          <Button size="md" className="h-[36px]" onClick={() => remove(index)} variant="plain">
            <Icon iconName="trash-can" iconStyle="regular" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export function ValuesOverrideArgumentsSetting({ methods, children, onSubmit }: ValuesOverrideArgumentsSettingProps) {
  const {
    fields: tfVars,
    append: tfVarsAppend,
    remove: tfVarsRemove,
  } = useFieldArray({
    control: methods.control,
    name: 'tf_vars',
  })

  return (
    <Section>
      <form onSubmit={onSubmit} className="w-full">
        <div className="space-y-10">
          <Section className="space-y-2">
            <Heading level={1}>Variables</Heading>
            <p className="text-sm text-neutral-350">Define variables that will be used by the Terraform service.</p>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Manifest variables</Heading>
              <p className="text-sm text-neutral-350">Auto-populate variables from existing .tfvar file(s).</p>
            </div>

            <Controller
              name="tf_var_file_paths"
              control={methods.control}
              defaultValue={methods.getValues('tf_var_file_paths')}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  type="text"
                  onChange={(e) => field.onChange(e.target.value.split(',').map((path) => path.trim()))}
                  value={field.value.join(',')}
                  label="Path to .tfvar file(s)"
                  error={error?.message}
                  hint="Comma separated file paths"
                  spellCheck={false}
                />
              )}
            />
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Input variables</Heading>
              <p className="text-sm text-neutral-350">
                Fill any additional environment variables required to execute the Terraform commands.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {tfVars.length > 0 && (
                <ul>
                  <li className="mb-3 grid grid-cols-[6fr_6fr_83px] gap-x-3">
                    <span className="text-sm font-medium text-neutral-350">Key</span>
                    <span className="text-sm font-medium text-neutral-350">Value</span>
                    <span className="text-sm font-medium text-neutral-350">Secret</span>
                  </li>
                  {tfVars.map((field, index) => (
                    <VarRow key={field.id} index={index} remove={tfVarsRemove} />
                  ))}
                </ul>
              )}

              <Button
                className="gap-2 self-end"
                variant="surface"
                type="button"
                size="md"
                onClick={() =>
                  tfVarsAppend({
                    key: '',
                    value: '',
                    secret: false,
                  })
                }
              >
                Add variable
                <Icon iconName="plus-circle" iconStyle="regular" />
              </Button>
            </div>
          </Section>
        </div>

        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideArgumentsSetting

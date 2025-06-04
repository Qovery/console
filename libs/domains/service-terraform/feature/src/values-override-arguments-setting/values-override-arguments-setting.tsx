import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
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
import { Button, Heading, Icon, InputTextSmall, Section } from '@qovery/shared/ui'

export interface TerraformValuesArgumentsData {
  tf_var_file_paths: string[]
  tf_vars: {
    key: string
    value: string
  }[]
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
      <div className="grid grid-cols-[6fr_6fr_39px] items-center gap-x-2">
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

        <div>
          <Button
            size="md"
            color="neutral"
            variant="outline"
            type="button"
            className="h-[36px]"
            onClick={() => remove(index)}
          >
            <Icon iconName="trash" className="text-neutral-400" />
          </Button>
        </div>
      </div>
    </li>
  )
}

function PathRow({
  field,
  index,
  tfPathsRemove,
}: {
  field: Record<'id', string>
  index: number
  tfPathsRemove: (index: number) => void
}) {
  const { control } = useFormContext()

  return (
    <li key={`${field.id}-${index}`} className="mb-3 last:mb-0">
      <div className="flex items-center gap-x-2">
        <Controller
          name={`tf_var_file_paths.${index}`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              className="w-full"
            />
          )}
        />

        <Button
          size="md"
          color="neutral"
          variant="outline"
          type="button"
          className="h-[36px]"
          onClick={() => tfPathsRemove(index)}
        >
          <Icon iconName="trash" className="text-neutral-400" />
        </Button>
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
  const {
    fields: tfPaths,
    append: tfPathsAppend,
    remove: tfPathsRemove,
  } = useFieldArray({
    name: 'tf_var_file_paths',
  })

  return (
    <Section className="items-start">
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex w-full justify-between">
              <div>
                <Heading className="mb-2">Variables</Heading>
                <p className="mb-2 text-sm text-neutral-350">Specify each variable by declaring its key and value.</p>
              </div>

              <Button
                className="gap-2"
                size="lg"
                type="button"
                onClick={() =>
                  tfVarsAppend({
                    key: '',
                    value: '',
                  })
                }
              >
                Add Variable
                <Icon iconName="plus-circle" />
              </Button>
            </div>
            {tfVars.length > 0 && (
              <ul>
                <li className="mb-3 grid grid-cols-[6fr_6fr_1fr] gap-x-2">
                  <span className="text-sm font-medium text-neutral-400">Key</span>
                  <span className="text-sm font-medium text-neutral-400">Value</span>
                  <span></span>
                </li>
                {tfVars.map((field, index) => (
                  <VarRow key={field.id} index={index} remove={tfVarsRemove} />
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="flex w-full justify-between">
              <div>
                <Heading className="mb-2">File paths</Heading>
                <p className="mb-2 text-sm text-neutral-350">Specify each path by declaring its value.</p>
              </div>

              <Button className="gap-2" size="lg" type="button" onClick={() => tfPathsAppend('')}>
                Add Path
                <Icon iconName="plus-circle" />
              </Button>
            </div>
            {tfPaths.length > 0 && (
              <ul>
                <li className="mb-3 flex gap-x-2">
                  <span className="text-sm font-medium text-neutral-400">Path</span>
                </li>
                {tfPaths.map((field, index) => (
                  <PathRow key={field.id} field={field} index={index} tfPathsRemove={tfPathsRemove} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideArgumentsSetting

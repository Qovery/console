import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import {
  Controller,
  type UseFieldArrayRemove,
  type UseFormReturn,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { CodeEditorVariable, FieldVariableSuggestion } from '@qovery/domains/variables/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { HELM_DEFAULT_VALUES } from '@qovery/shared/routes'
import {
  Button,
  EmptyState,
  Heading,
  Icon,
  InputSelectSmall,
  InputTextSmall,
  Popover,
  Section,
} from '@qovery/shared/ui'

export type ArgumentTypes = '--set-json' | '--set' | '--set-string'

export interface HelmValuesArgumentsData {
  arguments: {
    key: string
    type: ArgumentTypes
    value: string
    json?: string
  }[]
}

export interface ValuesOverrideArgumentsSettingProps extends PropsWithChildren {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<HelmValuesArgumentsData>
  onSubmit: () => void
  isSetting?: boolean
}

function Row({ index, remove }: { index: number; remove: UseFieldArrayRemove }) {
  const { environmentId = '' } = useParams()
  const { watch, control } = useFormContext()

  const [openEditor, setOpenEditor] = useState(true)
  const valueTypeJson = watch(`arguments.${index}.type`) === '--set-json'

  return (
    <li className="mb-3 last:mb-0">
      <div className="grid grid-cols-[6fr_6fr_6fr_1fr] items-center gap-x-2">
        <Controller
          name={`arguments.${index}.type`}
          control={control}
          defaultValue="--set"
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <InputSelectSmall
              name={field.name}
              onChange={field.onChange}
              defaultValue={field.value}
              inputClassName="bg-neutral-50"
              items={[
                {
                  label: '--set',
                  value: '--set',
                },
                {
                  label: '--set-string',
                  value: '--set-string',
                },
                {
                  label: '--set-json',
                  value: '--set-json',
                },
              ]}
            />
          )}
        />
        <Controller
          name={`arguments.${index}.key`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall name={field.name} value={field.value} onChange={field.onChange} error={error?.message} />
          )}
        />
        {valueTypeJson ? (
          <Button
            size="md"
            color="neutral"
            variant="surface"
            type="button"
            className="h-[36px] justify-between"
            onClick={() => setOpenEditor(!openEditor)}
          >
            {openEditor ? 'Close json' : 'Open json'}
            <Icon iconName="angle-down" className="text-neutral-400" />
          </Button>
        ) : (
          <Controller
            name={`arguments.${index}.value`}
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
        )}
        <Button
          size="md"
          color="neutral"
          variant="outline"
          type="button"
          className="h-[36px] w-full"
          onClick={() => remove(index)}
        >
          <Icon iconName="trash" className="text-neutral-400" />
        </Button>
      </div>
      {valueTypeJson && openEditor && (
        <Controller
          name={`arguments.${index}.json`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <CodeEditorVariable
              environmentId={environmentId}
              language="json"
              height="496px"
              className="mt-3 overflow-hidden rounded border border-neutral-250"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
    </li>
  )
}

export function ValuesOverrideArgumentsSetting({
  methods,
  children,
  onSubmit,
  source,
  isSetting = false,
}: ValuesOverrideArgumentsSettingProps) {
  const { environmentId = '' } = useParams()

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'arguments',
  })

  const createHelmDefaultValuesMutation = () => {
    const payload = {
      environmentId,
      helmDefaultValuesRequest: {
        source,
      },
    }
    window.open(`${HELM_DEFAULT_VALUES}?payload=${encodeURIComponent(JSON.stringify(payload))}`, '_blank')
  }

  return (
    <Section className="items-start">
      {isSetting ? (
        <SettingsHeading
          title="Value override as arguments"
          description="Specify each override by declaring the variable name, value and its type."
        >
          <Button
            className="gap-2"
            size="md"
            onClick={() =>
              append({
                key: '',
                type: '--set',
                value: '',
              })
            }
          >
            Add Variable
            <Icon iconName="plus-circle" iconStyle="regular" />
          </Button>
        </SettingsHeading>
      ) : (
        <>
          <div className="flex w-full justify-between">
            <div>
              <Heading className="mb-2">Value override as arguments</Heading>
              <p className="mb-2 text-sm text-neutral-350">
                Specify each override by declaring the variable name, value and its type.
              </p>
            </div>
            <Button
              className="gap-2"
              size="lg"
              onClick={() =>
                append({
                  key: '',
                  type: '--set',
                  value: '',
                })
              }
            >
              Add Variable
              <Icon iconName="plus-circle" />
            </Button>
          </div>
          <Popover.Root>
            <Popover.Trigger>
              <span className="mb-6 cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600">
                How it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
              </span>
            </Popover.Trigger>
            <Popover.Content side="left" className="relative text-sm text-neutral-350" style={{ width: 440 }}>
              <h6 className="mb-2 font-medium text-neutral-400">How it works</h6>
              <p>
                <ul className="list-disc pl-4">
                  <li>
                    Specify each override by declaring the variable name, value and its type. These will be passed via
                    the --set, --set-string and --set-json helm argument depending on the selected type (Generic, String
                    or Json). Please refer to the Helm documentation for more information on which one you should use.
                  </li>
                  <li>
                    Values set here have an higher override priority compared to the ones defined in the values as file
                    section , this allows you to manage specific configurations (example: test a change in a value
                    without changing your file).
                  </li>
                  <li>
                    You can assign any environment variable by adding the macro "qovery.env.ENV_VAR_NAME" within the
                    “Value” field.
                  </li>
                </ul>
              </p>
              <Popover.Close className="absolute right-4 top-4">
                <button type="button">
                  <Icon iconName="xmark" className="text-lg leading-4 text-neutral-400" />
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Root>
        </>
      )}
      <Button
        size="md"
        variant="surface"
        color="neutral"
        className="mb-10"
        onClick={() => createHelmDefaultValuesMutation()}
      >
        See default values.yaml <Icon className="ml-2 text-xs" iconName="arrow-up-right-from-square" />
      </Button>
      <form onSubmit={onSubmit} className="w-full">
        {fields.length > 0 ? (
          <ul>
            <li className="mb-3 grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2">
              <span className="text-sm font-medium text-neutral-400">Override type</span>
              <span className="text-sm font-medium text-neutral-400">Variable</span>
              <span className="text-sm font-medium text-neutral-400">Value</span>
              <span></span>
            </li>
            {fields.map((field, index) => (
              <Row key={field.id} index={index} remove={remove} />
            ))}
          </ul>
        ) : (
          <EmptyState title="No override defined" />
        )}
        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideArgumentsSetting

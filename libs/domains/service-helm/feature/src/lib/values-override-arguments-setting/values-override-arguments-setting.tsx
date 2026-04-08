import { useParams } from '@tanstack/react-router'
import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import {
  Controller,
  type UseFieldArrayRemove,
  type UseFormReturn,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { CodeEditorVariable, FieldVariableSuggestion } from '@qovery/domains/variables/feature'
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

export interface ValuesOverrideArgumentsSettingBaseProps extends PropsWithChildren {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<HelmValuesArgumentsData>
  onSubmit: () => void
  isSetting?: boolean
}

function Row({ index, remove, environmentId }: { index: number; remove: UseFieldArrayRemove; environmentId: string }) {
  const { watch, control } = useFormContext<HelmValuesArgumentsData>()

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
            <Icon iconName="angle-down" />
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
          className="h-[36px] w-[36px]"
          onClick={() => remove(index)}
        >
          <Icon iconName="trash" />
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
              className="mt-3 overflow-hidden rounded border border-neutral"
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
}: ValuesOverrideArgumentsSettingBaseProps) {
  const { environmentId = '' } = useParams({ strict: false })

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

  const addVariableButton = (
    <Button
      type="button"
      className="gap-2"
      size={isSetting ? 'md' : 'lg'}
      onClick={() =>
        append({
          key: '',
          type: '--set',
          value: '',
        })
      }
    >
      Add Variable
      <Icon iconName="plus-circle" iconStyle={isSetting ? 'regular' : undefined} />
    </Button>
  )

  const headerContent = !isSetting ? (
    <>
      <div className="flex w-full justify-between">
        <div>
          <Heading className="mb-2">Value override as arguments</Heading>
          <p className="mb-2 text-sm text-neutral-subtle">
            Specify each override by declaring the variable name, value and its type.
          </p>
        </div>
        {addVariableButton}
      </div>
      <Popover.Root>
        <Popover.Trigger>
          <span className="hover:text-brandHover mb-6 cursor-pointer text-sm font-medium text-brand transition">
            How it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
          </span>
        </Popover.Trigger>
        <Popover.Content side="left" className="relative text-sm text-neutral-subtle" style={{ width: 440 }}>
          <h6 className="mb-2 font-medium text-neutral">How it works</h6>
          <ul className="list-disc pl-4">
            <li>
              Specify each override by declaring the variable name, value and its type. These will be passed via the
              `--set`, `--set-string` and `--set-json` Helm arguments depending on the selected type.
            </li>
            <li>
              Values set here have a higher override priority than the ones defined in the values-as-file section, which
              lets you adjust a specific value without changing your file.
            </li>
            <li>
              You can assign any environment variable by using the `qovery.env.ENV_VAR_NAME` macro in the value field.
            </li>
          </ul>
          <Popover.Close className="absolute right-4 top-4">
            <button type="button">
              <Icon iconName="xmark" className="text-sm" />
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
    </>
  ) : null

  const content = (
    <>
      <Button
        type="button"
        size="md"
        variant="outline"
        color="neutral"
        className="mb-10 gap-2"
        onClick={() => createHelmDefaultValuesMutation()}
      >
        See default values.yaml <Icon className="text-xs" iconName="arrow-up-right-from-square" />
      </Button>
      {!isSetting ? (
        <form onSubmit={onSubmit} className="w-full">
          {fields.length > 0 ? (
            <ul>
              <li className="mb-3 grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2">
                <span className="text-sm font-medium text-neutral-subtle">Override type</span>
                <span className="text-sm font-medium text-neutral-subtle">Variable</span>
                <span className="text-sm font-medium text-neutral-subtle">Value</span>
                <span></span>
              </li>
              {fields.map((field, index) => (
                <Row key={field.id} index={index} remove={remove} environmentId={environmentId} />
              ))}
            </ul>
          ) : (
            <EmptyState icon="key" title="No override defined" />
          )}
          {children}
        </form>
      ) : (
        <div className="w-full">
          {fields.length > 0 ? (
            <ul>
              <li className="mb-3 grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2">
                <span className="text-sm font-medium text-neutral-subtle">Override type</span>
                <span className="text-sm font-medium text-neutral-subtle">Variable</span>
                <span className="text-sm font-medium text-neutral-subtle">Value</span>
                <span></span>
              </li>
              {fields.map((field, index) => (
                <Row key={field.id} index={index} remove={remove} environmentId={environmentId} />
              ))}
            </ul>
          ) : (
            <EmptyState icon="key" title="No override defined" />
          )}
          {children}
        </div>
      )}
    </>
  )

  return (
    <Section className="items-start">
      {headerContent}
      {content}
    </Section>
  )
}

export default ValuesOverrideArgumentsSetting

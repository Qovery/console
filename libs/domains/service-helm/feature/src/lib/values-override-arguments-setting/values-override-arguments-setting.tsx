import { type PropsWithChildren, useState } from 'react'
import {
  Controller,
  type UseFieldArrayRemove,
  type UseFormReturn,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import {
  Button,
  CodeEditor,
  EmptyState,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelectSmall,
  InputTextSmall,
  Popover,
  Section,
} from '@qovery/shared/ui'

export interface HelmValuesArgumentsData {
  arguments: {
    key: string
    type: string
    value: string
    json?: string
  }[]
}

export interface ValuesOverrideArgumentsSettingProps extends PropsWithChildren {
  methods: UseFormReturn<HelmValuesArgumentsData>
  onSubmit: () => void
}

function Row({ index, remove }: { index: number; remove: UseFieldArrayRemove }) {
  const { watch, control } = useFormContext()

  const [openEditor, setOpenEditor] = useState(true)
  const valueTypeJson = watch(`arguments.${index}.type`) === 'json'

  return (
    <li className="mb-3 last:mb-0">
      <div className="grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2 items-center">
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
        <Controller
          name={`arguments.${index}.type`}
          control={control}
          defaultValue="generic"
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
                  label: 'Generic',
                  value: 'generic',
                },
                {
                  label: 'String',
                  value: 'string',
                },
                {
                  label: 'Json',
                  value: 'json',
                },
              ]}
            />
          )}
        />
        {valueTypeJson ? (
          <Button
            size="md"
            color="neutral"
            variant="surface"
            type="button"
            className="justify-between h-[36px]"
            onClick={() => setOpenEditor(!openEditor)}
          >
            {openEditor ? 'Close json' : 'Open json'}
            <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="text-neutral-400" />
          </Button>
        ) : (
          <Controller
            name={`arguments.${index}.value`}
            control={control}
            rules={{
              required: true,
            }}
            render={({ field, fieldState: { error } }) => (
              <InputTextSmall name={field.name} value={field.value} onChange={field.onChange} error={error?.message} />
            )}
          />
        )}
        <Button
          size="md"
          color="neutral"
          variant="outline"
          type="button"
          className="w-full h-[36px]"
          onClick={() => remove(index)}
        >
          <Icon name={IconAwesomeEnum.TRASH} className="text-neutral-400" />
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
            <CodeEditor
              language="json"
              height="496px"
              className="border border-neutral-250 rounded overflow-hidden mt-3"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
    </li>
  )
}

export function ValuesOverrideArgumentsSetting({ methods, children, onSubmit }: ValuesOverrideArgumentsSettingProps) {
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'arguments',
  })

  return (
    <Section className="items-start">
      <div className="flex justify-between w-full">
        <div>
          <Heading className="mb-2">Value override as arguments</Heading>
          <p className="text-sm text-neutral-350 mb-2">
            Specify each override by declaring the variable name, value and its type.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() =>
            append({
              key: '',
              type: 'generic',
              value: '',
            })
          }
        >
          Add variable
        </Button>
      </div>
      <Popover.Root>
        <Popover.Trigger>
          <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium mb-10">
            How it works <Icon className="text-xs" name={IconAwesomeEnum.CIRCLE_QUESTION} />
          </span>
        </Popover.Trigger>
        <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
          <h6 className="text-neutral-400 font-medium mb-2">How it works</h6>
          <p>
            Specify each override by declaring the variable name, value and its type. These will be passed via the
            --set, --set-string and --set-json helm argument depending on the selected type (Generic, String or Json).
            Values set here have the higher override priority.
          </p>
          <Popover.Close className="absolute top-4 right-4">
            <button type="button">
              <Icon name={IconAwesomeEnum.XMARK} className="text-lg leading-4 text-neutral-400" />
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <form onSubmit={onSubmit} className="w-full">
        {fields.length > 0 ? (
          <ul>
            <li className="grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2 mb-3">
              <span className="text-sm text-neutral-400 font-medium">Variable</span>
              <span className="text-sm text-neutral-400 font-medium">Value type</span>
              <span className="text-sm text-neutral-400 font-medium">Value</span>
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

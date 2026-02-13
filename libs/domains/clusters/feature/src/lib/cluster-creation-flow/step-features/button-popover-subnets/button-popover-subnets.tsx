import { clsx } from 'clsx'
import { type FormEvent, type PropsWithChildren, type ReactNode } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  type UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { type Subnets } from '@qovery/shared/interfaces'
import { Button, Icon, InputTextSmall, Popover, Tooltip } from '@qovery/shared/ui'

const removeEmptySubnet = (objects?: Subnets[]) =>
  objects?.filter((field) => field.A !== '' || field.B !== '' || field.C !== '')

export interface ButtonPopoverSubnetsProps extends PropsWithChildren {
  sections: {
    title: string
    name: string
    callout?: ReactNode
  }[]
  required?: boolean
}

export interface SubnetsProps extends PropsWithChildren {
  control: Control<FieldValues>
  title: string
  name: string
  callout?: ReactNode
  required?: boolean
}

function Row({ index, remove, name }: { index: number; remove: UseFieldArrayRemove; name: string }) {
  const { control } = useFormContext()

  return (
    <li className="grid grid-cols-[6fr_6fr_6fr_1fr] items-center gap-x-2">
      <Controller
        name={`${name}.${index}.A`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextSmall
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const value = e.currentTarget.value.replace(/\s/g, '')
              field.onChange({ target: { value } })
            }}
            error={error?.message}
          />
        )}
      />
      <Controller
        name={`${name}.${index}.B`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextSmall
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const value = e.currentTarget.value.trim()
              field.onChange({ target: { value } })
            }}
            error={error?.message}
          />
        )}
      />
      <Controller
        name={`${name}.${index}.C`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextSmall
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const value = e.currentTarget.value.trim()
              field.onChange({ target: { value } })
            }}
            error={error?.message}
          />
        )}
      />
      <Button size="md" variant="plain" type="button" className="w-full" onClick={() => remove(index)}>
        <Icon iconName="trash-can" iconStyle="regular" className="text-base" />
      </Button>
    </li>
  )
}

function isFieldValid({ subnets = [], required }: { subnets?: Subnets[]; required: boolean }) {
  return subnets.length === 0 && !required
    ? true
    : !!subnets.find(({ A, B, C }) => Boolean(A) && Boolean(B) && Boolean(C))
}

export function SubnetsForm({ control, name, title, callout, required = false }: SubnetsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    rules: {
      validate: (data) => isFieldValid({ subnets: removeEmptySubnet(data as Subnets[]), required }),
    },
    shouldUnregister: true,
  })

  return (
    <div className="flex flex-col gap-3 p-4">
      {callout}
      <h6 className="font-medium text-neutral">{title}</h6>
      {fields.length > 0 && (
        <ul className="flex flex-col gap-3">
          <li className="grid grid-cols-[6fr_6fr_6fr_1fr] items-center gap-x-2 text-sm font-medium text-neutral-subtle">
            <span>IDs zone A</span>
            <span>IDs zone B</span>
            <span>IDs zone C</span>
            <span></span>
          </li>
          {fields.map((field, index) => (
            <Row key={field.id} index={index} remove={remove} name={name} />
          ))}
        </ul>
      )}
      <Button
        className="self-end"
        type="button"
        size="md"
        variant="plain"
        onClick={() => append({ A: '', B: '', C: '' })}
      >
        Add subnets
        <Icon iconName="plus" className="ml-2 text-base" />
      </Button>
    </div>
  )
}

export function ButtonPopoverSubnets({ children, sections, required = false }: ButtonPopoverSubnetsProps) {
  const { control, watch, setValue, getValues } = useFormContext()

  const watchSubnetsFields = sections.map(({ name }) => removeEmptySubnet(watch(name)))
  const isValid = watchSubnetsFields.reduce(
    (acc, watchSubnets) => acc && isFieldValid({ subnets: watchSubnets, required }),
    true
  )

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button
          type="button"
          radius="full"
          color="neutral"
          variant="outline"
          className={clsx(
            'self-start',
            watchSubnetsFields.reduce((acc, watchSubnets) => !!watchSubnets && watchSubnets.length > 0 && acc, true) &&
              isValid &&
              'border-positive-strong bg-surface-positive-component',
            !isValid && 'border-negative-strong bg-surface-negative-component'
          )}
          onClick={() => {
            for (const { name } of sections) {
              if (getValues(name)?.length === 0) {
                setValue(name, [
                  {
                    A: '',
                    B: '',
                    C: '',
                  },
                ])
              }
            }
          }}
        >
          {children}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        side="bottom"
        className="relative divide-y divide-neutral p-0 text-sm text-neutral data-[state=open]:block data-[state=closed]:hidden"
        style={{ width: 648 }}
        forceMount
      >
        {sections.map(({ title, name, callout }) => (
          <SubnetsForm key={name} control={control} title={title} name={name} callout={callout} required={required} />
        ))}

        <div className="flex flex-col gap-4 p-4 text-right text-base">
          <div>
            <Popover.Close>
              <Button type="button" size="md" variant="plain" className="mr-1">
                Cancel
              </Button>
            </Popover.Close>
            <Popover.Close>
              <span>
                <Tooltip content="Please fill all fields" disabled={isValid}>
                  <Button disabled={!isValid} size="md" type="button">
                    Confirm
                  </Button>
                </Tooltip>
              </span>
            </Popover.Close>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ButtonPopoverSubnets

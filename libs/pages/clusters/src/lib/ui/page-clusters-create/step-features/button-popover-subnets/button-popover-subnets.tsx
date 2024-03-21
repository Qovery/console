import { clsx } from 'clsx'
import { type FormEvent, type PropsWithChildren, type ReactNode } from 'react'
import { Controller, type UseFieldArrayRemove, useFieldArray, useFormContext } from 'react-hook-form'
import { type Subnets } from '@qovery/shared/interfaces'
import { Button, Icon, InputTextSmall, Popover } from '@qovery/shared/ui'
import { removeEmptySubnet } from '../../../../feature/page-clusters-create-feature/step-features-feature/step-features-feature'

export interface ButtonPopoverSubnetsProps extends PropsWithChildren {
  title: string
  name: string
  callout?: ReactNode
  required?: boolean
}

function Row({ index, remove, name }: { index: number; remove: UseFieldArrayRemove; name: string }) {
  const { control } = useFormContext()

  return (
    <li className="grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2 items-center">
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

export function ButtonPopoverSubnets({ name, children, title, callout, required = false }: ButtonPopoverSubnetsProps) {
  const { control, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    rules: {
      validate: (data) => isFieldValid({ subnets: removeEmptySubnet(data as Subnets[]), required }),
    },
  })

  const watchSubnets = removeEmptySubnet(watch(name))
  // XXX: We cannot rely on `useFormContext` `formState.errors` because `errors` aren't reset when modifying back to a valid state.
  // Probably due to a bug in react-hook-form with nested fields
  const isValid = isFieldValid({ subnets: watchSubnets, required })

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
            watchSubnets && watchSubnets.length > 0 && isValid && 'bg-white border-green-500',
            !isValid && 'bg-white border-red-500'
          )}
          onClick={() =>
            fields.length === 0 &&
            append({
              A: '',
              B: '',
              C: '',
            })
          }
        >
          {children}
        </Button>
      </Popover.Trigger>
      <Popover.Content side="bottom" className="text-neutral-350 text-sm relative" style={{ width: 648 }}>
        <h6 className="text-neutral-400 font-medium mb-4">{title}</h6>
        {callout && <div className="mb-4">{callout}</div>}
        {fields.length > 0 && (
          <ul className="flex flex-col gap-3 mb-3">
            <li className="grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2 items-center">
              <span className="text-sm text-neutral-350 font-medium">IDs zone A</span>
              <span className="text-sm text-neutral-350 font-medium">IDs zone B</span>
              <span className="text-sm text-neutral-350 font-medium">IDs zone C</span>
              <span></span>
            </li>
            {fields.map((field, index) => (
              <Row key={field.id} index={index} remove={remove} name={name} />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-4 text-right text-base">
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
          <div>
            <Popover.Close>
              <Button
                type="button"
                size="md"
                variant="plain"
                className="mr-1"
                onClick={() => remove(Array.from({ length: fields.length }, (_, index) => index))}
              >
                Clear
              </Button>
            </Popover.Close>
            <Popover.Close>
              <Button size="md" type="button">
                Confirm
              </Button>
            </Popover.Close>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ButtonPopoverSubnets

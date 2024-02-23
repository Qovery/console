import { type PropsWithChildren } from 'react'
import { Controller, type UseFieldArrayRemove, useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Icon, IconAwesomeEnum, InputTextSmall, Popover } from '@qovery/shared/ui'

export interface ButtonPopoverSubnetsProps extends PropsWithChildren {
  title: string
  name: string
}

function Row({ key, index, remove, name }: { key: string; index: number; remove: UseFieldArrayRemove; name: string }) {
  const { control } = useFormContext()

  return (
    <li key={key} className="grid grid-cols-[6fr_6fr_6fr_1fr] gap-x-2 items-center">
      <Controller
        name={`${name}.${index}.A`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextSmall
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
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
            onChange={field.onChange}
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
            onChange={field.onChange}
            error={error?.message}
          />
        )}
      />
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
    </li>
  )
}

export function ButtonPopoverSubnets({ name, children, title }: ButtonPopoverSubnetsProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  console.log('fields', fields)

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button
          type="button"
          radius="full"
          color="neutral"
          variant="outline"
          className="self-start"
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
            variant="surface"
            onClick={() => append({ A: '', B: '', C: '' })}
          >
            Add subnet
            <Icon name={IconAwesomeEnum.PLUS} className="ml-2 text-base relative -top-[2px]" />
          </Button>
          <div>
            <Popover.Close>
              <Button
                type="button"
                size="md"
                variant="surface"
                onClick={() => remove(Array.from({ length: fields.length }, (_, index) => index + 1))}
              >
                Cancel
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

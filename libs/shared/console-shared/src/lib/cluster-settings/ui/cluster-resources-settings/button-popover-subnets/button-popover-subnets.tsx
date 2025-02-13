import { type FormEvent, type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  type UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { type Subnets } from '@qovery/shared/interfaces'
import { Button, Callout, Icon, InputTextSmall, Popover, Tooltip } from '@qovery/shared/ui'

export interface ButtonPopoverSubnetsProps extends PropsWithChildren {
  disabled: boolean
}

export interface SubnetsProps extends PropsWithChildren {
  control: Control<FieldValues>
  title: string
  name: string
  callout: ReactNode
  required: boolean
}

export const removeEmptySubnet = (objects?: Subnets[]) =>
  objects?.filter((field) => field.A !== '' || field.B !== '' || field.C !== '')

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
      <h6 className="flex items-center gap-1.5 font-medium text-neutral-400">
        {title}
        <Tooltip content="These subnets are used for AWS Fargate profile">
          <span className="text-sm0">
            <Icon iconName="circle-info" iconStyle="regular" />
          </span>
        </Tooltip>
      </h6>
      {fields.length > 0 && (
        <ul className="flex flex-col gap-3">
          <li className="grid grid-cols-[6fr_6fr_6fr_1fr] items-center gap-x-2 text-sm font-medium text-neutral-350">
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

// XXX: This component is inspired by `/page-clusters-create/step-features/button-popover-subnets/button-popover-subnets.tsx`
// This component should be removed after Karpenter support
export function ButtonPopoverSubnets({ children, disabled }: ButtonPopoverSubnetsProps) {
  const { control, setValue, watch } = useFormContext()
  const watchKarpenterEnabled = watch('karpenter.enabled')
  const [isOpen, setIsOpen] = useState(false)

  // XXX: We cannot rely on `useFormContext` `formState.errors` because `errors` aren't reset when modifying back to a valid state.
  // Probably due to a bug in react-hook-form with nested fields
  const isValid = isFieldValid({ subnets: watch('aws_existing_vpc.eks_subnets'), required: true })

  useEffect(() => {
    setIsOpen(watchKarpenterEnabled && !disabled)
  }, [watchKarpenterEnabled, disabled])

  if (disabled) return children

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger
        onClick={() => {
          setValue('aws_existing_vpc.eks_subnets', [
            {
              A: '',
              B: '',
              C: '',
            },
          ])
        }}
      >
        <div>{children}</div>
      </Popover.Trigger>
      <Popover.Content
        side="bottom"
        className="relative divide-y p-0 text-sm text-neutral-350 data-[state=open]:block data-[state=closed]:hidden"
        style={{ width: 648 }}
        forceMount
      >
        <SubnetsForm
          control={control}
          title="EKS private subnet IDs"
          name="aws_existing_vpc.eks_subnets"
          callout={
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="exclamation-circle" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription>
                  Karpenter cannot be enabled until the private subnet IDs are added for EKS, as you are using an
                  existing VPC.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          }
          required={true}
        />

        <div className="flex flex-col gap-4 p-4 text-right text-base">
          <div>
            <Popover.Close>
              <Button
                type="button"
                size="md"
                variant="plain"
                className="mr-1"
                onClick={() => {
                  setValue('karpenter.enabled', false)
                  setIsOpen(false)
                }}
              >
                Cancel
              </Button>
            </Popover.Close>
            <Popover.Close>
              <span>
                <Tooltip content="Please fill all fields" disabled={isValid}>
                  <Button disabled={!isValid} size="md" type="button" onClick={() => setIsOpen(false)}>
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

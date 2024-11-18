import { type CheckedState } from '@radix-ui/react-checkbox'
import * as Collapsible from '@radix-ui/react-collapsible'
import { type ClusterInstanceAttributes, type CpuArchitectureEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { Checkbox, Icon, Tooltip } from '@qovery/shared/ui'
import { type KarpenterInstanceFormProps } from '../karpenter-instance-filter-modal'

const getInstanceTypeCategory = (instancePrefix: string): string => {
  const prefix = instancePrefix.toLowerCase()

  // Mapping of instance to display title
  // Related to this page: https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-types.html
  const categoryMap: Record<string, string> = {
    a: 'General Purpose',
    c: 'Compute Optimized',
    d: 'Storage Optimized',
    f: 'Accelerated computing',
    g: 'Accelerated Computing',
    gr: 'Accelerated computing',
    h: 'Storage optimized',
    hpc: 'High-performance Computing',
    i: 'Storage Optimized',
    im: 'Storage Optimized',
    inf: 'Accelerated computing',
    is: 'Storage optimized',
    m: 'General Purpose',
    p: 'Accelerated Computing',
    r: 'Memory Optimized',
    t: 'General Purpose',
    trn: 'Accelerated computing',
    v: 'Accelerated Computing',
    vt: 'Accelerated Computing',
    x: 'Memory Optimized',
    z: 'Memory Optimized',
  }

  return categoryMap[prefix] || 'Unknown'
}

export interface ClusterInstanceAttributesExtended extends ClusterInstanceAttributes {
  architecture: CpuArchitectureEnum
  sizes: string[]
}

export interface InstanceCategoryProps {
  title: string
  attributes: ClusterInstanceAttributesExtended[]
}

export function InstanceCategory({ title, attributes }: InstanceCategoryProps) {
  const [open, setOpen] = useState(false)
  const { control, watch, setValue } = useFormContext<KarpenterInstanceFormProps>()

  const watchSizes = watch('sizes') || []
  const watchAMD64 = watch('AMD64')
  const watchARM64 = watch('ARM64')
  const watchCategories = watch(`categories.${title}`) || []
  const validAttributes = attributes.filter((a) => a.instance_family)

  const checked = match({
    selectedCount: watchCategories.length,
    totalCount: validAttributes.length,
  })
    .returnType<CheckedState>()
    .with({ totalCount: 0 }, () => false)
    .with({ selectedCount: P.number.gt(0), totalCount: P.number.gt(0) }, ({ selectedCount, totalCount }) =>
      selectedCount === totalCount ? true : 'indeterminate'
    )
    .otherwise(() => false)

  const attributeCheckboxState = (attribute: ClusterInstanceAttributesExtended) => {
    const architectureEnabled = match(attribute.architecture)
      .with('AMD64', () => watchAMD64)
      .with('ARM64', () => watchARM64)
      .otherwise(() => false)

    const sizeDisabled = !watchSizes.some((size) => attribute.sizes.includes(size))

    const getTooltipMessage = () => {
      const conditions = []

      if (!architectureEnabled) {
        conditions.push(<span>{attribute.architecture} architecture must be enabled for this instance type.</span>)
      }

      if (sizeDisabled) {
        const availableSizes = attribute.sizes.join(', ')
        conditions.push(
          <span>
            Selected size not available for this instance.
            <br />
            Available sizes: {availableSizes}
          </span>
        )
      }

      if (conditions.length === 0) return false

      return (
        <span className="flex flex-col gap-2">
          {conditions.map((condition, index) => (
            <span key={index}>{condition}</span>
          ))}
        </span>
      )
    }

    return {
      disabled: sizeDisabled || !architectureEnabled,
      message: getTooltipMessage(),
    }
  }

  return (
    <Collapsible.Root key={title} open={open} onOpenChange={setOpen} asChild>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 py-1">
          <Checkbox
            name={title}
            className="shrink-0"
            checked={checked}
            onCheckedChange={(checked: boolean) => {
              if (checked) {
                // Check all children
                setValue(
                  `categories.${title}`,
                  attributes.map((a) => a.instance_family).filter((item): item is string => item !== undefined)
                )
              } else {
                // Uncheck all children
                setValue(`categories.${title}`, [])
              }
            }}
          />
          <Collapsible.Trigger className="flex w-full items-center justify-between gap-3">
            <span className="text-neutral-400">
              {title.toUpperCase()} - {getInstanceTypeCategory(title)}
            </span>
            <Icon className="text-sm text-neutral-350" iconName={open ? 'chevron-up' : 'chevron-down'} />
          </Collapsible.Trigger>
        </div>

        <Collapsible.Content asChild>
          <div className="flex flex-col">
            {attributes.map((attribute) => {
              const { disabled, message } = attributeCheckboxState(attribute)

              // Not used `field.value` because it's not updated with select all / unselect all
              const value = watch(`categories.${title}`)?.includes(attribute.instance_family!)

              return (
                <div key={attribute.instance_family}>
                  {disabled ? (
                    <Tooltip content={message} side="right">
                      <div className="flex w-fit items-center gap-3 py-1 pl-6">
                        <Checkbox
                          className="shrink-0"
                          id={`${title}-${attribute.instance_family}`}
                          checked={false}
                          disabled
                        />
                        <label htmlFor={`${title}-${attribute.instance_family}`} className="text-neutral-400">
                          {attribute.instance_family}
                        </label>
                      </div>
                    </Tooltip>
                  ) : (
                    <Controller
                      name={`categories.${title}`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex w-fit items-center gap-3 py-1 pl-6">
                          <Checkbox
                            className="shrink-0"
                            id={`${title}-${attribute.instance_family}`}
                            checked={value}
                            disabled={disabled}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value || []), attribute.instance_family!]
                                : (field.value || []).filter((v) => v !== attribute.instance_family)
                              field.onChange(newValue)
                            }}
                          />
                          <label htmlFor={`${title}-${attribute.instance_family}`} className="text-neutral-400">
                            {attribute.instance_family}
                          </label>
                        </div>
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

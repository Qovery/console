import { type CheckedState } from '@radix-ui/react-checkbox'
import * as Collapsible from '@radix-ui/react-collapsible'
import { type ClusterInstanceAttributes } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { Checkbox, Icon } from '@qovery/shared/ui'

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

export interface InstanceCategoryProps {
  title: string
  attributes: ClusterInstanceAttributes[]
}

export function InstanceCategory({ title, attributes }: InstanceCategoryProps) {
  const [open, setOpen] = useState(false)

  const { control, watch, setValue } = useFormContext<{ categories: Record<string, string[]> }>()

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
            {attributes.map((attribute) => (
              <div key={attribute.instance_family} className="flex items-center gap-3 py-1 pl-6">
                <Controller
                  name={`categories.${title}`}
                  control={control}
                  render={({ field }) => (
                    <>
                      <Checkbox
                        className="shrink-0"
                        id={`${title}-${attribute.instance_family}`}
                        checked={field.value?.includes(attribute.instance_family!)}
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
                    </>
                  )}
                />
              </div>
            ))}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

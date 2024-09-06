import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

// Inspired by https://github.com/radix-ui/themes/blob/b46984504c4f87306140b2c6078508d7b10af3b4/packages/radix-ui-themes/src/components/segmented-control.tsx

interface SegmentedControlRootProps
  extends Omit<ToggleGroupPrimitive.ToggleGroupSingleProps, 'type' | 'asChild' | 'disabled'> {
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
}

const SegmentedControlRoot = forwardRef<ElementRef<typeof ToggleGroupPrimitive.Root>, SegmentedControlRootProps>(
  function SegmentedControlRoot(
    {
      className,
      children,
      value: valueProp,
      defaultValue: defaultValueProp,
      onValueChange: onValueChangeProp,
      ...props
    },
    forwardedRef
  ) {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChangeProp,
      defaultProp: defaultValueProp,
    })

    return (
      <ToggleGroupPrimitive.Root
        ref={forwardedRef}
        className={twMerge(
          'relative inline-grid h-9 min-w-max auto-cols-[1fr] grid-flow-col items-stretch rounded bg-neutral-150 align-top font-medium text-neutral-300',
          className
        )}
        onValueChange={(value) => {
          if (value) {
            setValue(value)
          }
        }}
        {...props}
        type="single"
        value={value}
        asChild={false}
        disabled={false}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    )
  }
)

interface SegmentedControlItemProps
  extends Omit<ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, 'asChild' | 'disabled' | 'value'> {
  value: string
}

const SegmentedControlItem = forwardRef<ElementRef<typeof ToggleGroupPrimitive.Item>, SegmentedControlItemProps>(
  function SegmentedControlItem({ children, className, ...props }, forwardedRef) {
    return (
      <ToggleGroupPrimitive.Item
        ref={forwardedRef}
        className={twMerge('group box-border flex select-none items-stretch', className)}
        {...props}
        disabled={false}
        asChild={false}
      >
        {/* SegmentedControlItemLabel */}
        <span className="box-border flex grow items-center justify-center">
          {/* SegmentedControlItemLabelActive */}
          <span className="box-border flex h-9 grow items-center justify-center rounded border border-neutral-250 bg-white px-4 text-neutral-400 opacity-0 shadow-sm group-data-[state=on]:opacity-100">
            {children}
          </span>
          {/* SegmentedControlItemLabelInactive */}
          <span className="absolute box-border flex grow items-center justify-center opacity-100 group-data-[state=on]:opacity-0">
            {children}
          </span>
        </span>
      </ToggleGroupPrimitive.Item>
    )
  }
)

const SegmentedControl = Object.assign(
  {},
  {
    Root: SegmentedControlRoot,
    Item: SegmentedControlItem,
  }
)

export { SegmentedControl, SegmentedControlRoot, SegmentedControlItem }
export type { SegmentedControlRootProps, SegmentedControlItemProps }

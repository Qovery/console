import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react'
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
          'relative inline-grid h-9 min-w-max auto-cols-[1fr] grid-flow-col items-stretch rounded border border-neutral bg-surface-neutral-component align-top text-ssm font-medium leading-[18px] text-neutral-disabled',
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
  icon?: ReactNode
  value: string
}

const SegmentedControlItem = forwardRef<ElementRef<typeof ToggleGroupPrimitive.Item>, SegmentedControlItemProps>(
  function SegmentedControlItem({ children, className, icon, ...props }, forwardedRef) {
    return (
      <ToggleGroupPrimitive.Item
        ref={forwardedRef}
        className={twMerge(
          'box-border flex select-none items-center justify-center gap-2 rounded px-4 transition-colors hover:text-neutral data-[state=on]:bg-surface-neutral data-[state=on]:text-neutral',
          className
        )}
        {...props}
        disabled={false}
        asChild={false}
      >
        {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
        <span>{children}</span>
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

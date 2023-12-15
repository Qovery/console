import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

interface ToggleGroupItemProps extends ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> {}

const ToggleGroupItem = forwardRef<ElementRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <ToggleGroupPrimitive.Item {...props} ref={forwardedRef}>
      {children}
    </ToggleGroupPrimitive.Item>
  )
)

const ToggleGroup = Object.assign(
  {},
  {
    Root: ToggleGroupPrimitive.Root,
    Item: ToggleGroupItem,
  }
)

const ToggleGroupRoot = ToggleGroupPrimitive.Root

export { ToggleGroup, ToggleGroupRoot, ToggleGroupItem }

export type { ToggleGroupItemProps }

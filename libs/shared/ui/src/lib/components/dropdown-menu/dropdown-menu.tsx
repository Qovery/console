import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const dropdownMenuItemVariants = cva(
  ['px-3', 'flex', 'items-center', 'h-8', 'text-sm', 'font-medium', 'cursor-pointer', 'rounded-sm'],
  {
    variants: {
      color: {
        brand: ['hover:bg-brand-50', 'hover:text-brand-500'],
        green: ['hover:bg-green-50', 'hover:text-green-500'],
        red: ['hover:bg-red-50', 'hover:text-red-500'],
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

interface DropdownMenuItemProps
  extends VariantProps<typeof dropdownMenuItemVariants>,
    Omit<ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, 'color'> {}

const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(
  function DropdownMenuItem({ color, children, className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Item
        {...props}
        className={twMerge(dropdownMenuItemVariants({ color }), className)}
        ref={ref}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    )
  }
)

interface DropdownMenuContentProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(
  function DropdownMenuContent({ children, className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Content
        {...props}
        className={twMerge('w-[258px] p-3 bg-neutral-50 rounded', className)}
        ref={ref}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    )
  }
)

const DropdownMenu = Object.assign(
  {},
  {
    Root: DropdownMenuPrimitive.Root,
    Trigger: DropdownMenuPrimitive.Trigger,
    Portal: DropdownMenuPrimitive.Portal,
    Content: DropdownMenuContent,
    Arrow: DropdownMenuPrimitive.Arrow,
    Group: DropdownMenuPrimitive.Group,
    Item: DropdownMenuItem,
  }
)

export { DropdownMenu }

export type { DropdownMenuItemProps }

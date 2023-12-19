import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const dropdownMenuItemVariants = cva(
  ['px-3', 'flex', 'items-center', 'h-9', 'text-sm', 'font-medium', 'cursor-pointer', 'rounded-sm', 'outline-none'],
  {
    variants: {
      color: {
        brand: [
          'text-neutral-400',
          'dark:text-neutral-100',
          'hover:bg-brand-50',
          'data-[highlighted]:bg-brand-50',
          'hover:text-brand-500',
          'data-[highlighted]:text-brand-500',
        ],
        red: ['hover:bg-red-50', 'data-[highlighted]:bg-red-50', 'text-red-600', 'data-[highlighted]:text-red-600'],
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
  function DropdownMenuContent({ children, sideOffset = 12, align = 'start', className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Content
        {...props}
        sideOffset={sideOffset}
        align={align}
        className={twMerge(
          'flex flex-col gap-1 w-[258px] p-3 bg-neutral-50 shadow-[0_0_32px_rgba(0,0,0,0.08)] rounded-md data-[state=open]:data-[side=top]:animate-slidein-down-md-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=bottom]:animate-slidein-up-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded',
          className
        )}
        ref={ref}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    )
  }
)

interface DropdownMenuSeparatorProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {}

const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      {...props}
      className={twMerge('w-full h-[1px] bg-neutral-200 dark:bg-neutral-600 my-2', className)}
      ref={ref}
    />
  )
})

interface DropdownMenuArrowProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Arrow> {}

const DropdownMenuArrow = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Arrow>, DropdownMenuArrowProps>(
  function DropdownMenuArrow({ className, width = 12, height = 6, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Arrow
        {...props}
        width={width}
        height={height}
        className={twMerge('fill-white', className)}
        ref={ref}
      />
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
    Arrow: DropdownMenuArrow,
    Group: DropdownMenuPrimitive.Group,
    Item: DropdownMenuItem,
    Separator: DropdownMenuSeparator,
  }
)

export { DropdownMenu }

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Slottable } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, type ReactElement, cloneElement, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const dropdownMenuItemVariants = cva(
  ['px-3', 'flex', 'items-center', 'h-8', 'text-sm', 'font-medium', 'rounded-sm', 'outline-none', 'select-none', 'rounded'],
  {
    variants: {
      color: {
        brand: [
          'data-[highlighted]:bg-surface-brand-component',
          'data-[highlighted]:text-brand',
          'hover:bg-surface-brand-component',
          'hover:text-brand',
        ],
        red: [
          'data-[highlighted]:bg-surface-negative-component',
          'data-[highlighted]:text-negative',
          'hover:bg-surface-negative-component',
          'hover:text-negative',
        ],
        yellow: [
          'data-[highlighted]:bg-surface-warning-component',
          'data-[highlighted]:text-warning',
          'hover:bg-surface-warning-component',
          'hover:text-warning',
        ],
      },
      disabled: {
        true: ['cursor-not-allowed, hover:bg-transparent, hover:text-neutral-disabled'],
        false: ['cursor-pointer'],
      },
    },
    compoundVariants: [
      {
        color: 'brand',
        disabled: true,
        className: ['text-neutral-disabled'],
      },
      {
        color: 'brand',
        disabled: false,
        className: ['text-neutral'],
      },
      {
        color: 'red',
        disabled: true,
        className: ['text-neutral-disabled'],
      },
      {
        color: 'red',
        disabled: false,
        className: ['hover:bg-surface-negative-component', 'text-negative'],
      },
      {
        color: 'yellow',
        disabled: false,
        className: ['hover:bg-surface-warning-component', 'text-warning'],
      },
    ],
    defaultVariants: {
      color: 'brand',
      disabled: false,
    },
  }
)

const dropdownMenuItemIconVariants = cva(['text-sm', 'mr-2'], {
  variants: {
    color: {
      brand: [],
      red: [],
      yellow: [],
    },
    disabled: {
      true: [],
      false: [],
    },
  },
  compoundVariants: [
    {
      color: 'brand',
      disabled: true,
      className: ['text-neutral-disabled'],
    },
    {
      color: 'brand',
      disabled: false,
      className: ['text-brand-9'],
    },
    {
      color: 'red',
      disabled: true,
      className: ['text-neutral-disabled'],
    },
    {
      color: 'red',
      disabled: false,
      className: ['text-negative'],
    },
    {
      color: 'yellow',
      disabled: false,
      className: ['text-warning'],
    },
  ],
  defaultVariants: {
    color: 'brand',
    disabled: false,
  },
})

interface DropdownMenuItemProps
  extends Omit<VariantProps<typeof dropdownMenuItemVariants>, 'disabled'>,
    Omit<ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, 'color'> {
  icon?: ReactElement
}

const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(
  function DropdownMenuItem({ color, icon, children, className, disabled, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Item
        {...props}
        disabled={disabled}
        className={twMerge(dropdownMenuItemVariants({ color, disabled }), className)}
        ref={ref}
      >
        {icon && cloneElement(icon, { className: dropdownMenuItemIconVariants({ color, disabled }) })}
        <Slottable>{children}</Slottable>
      </DropdownMenuPrimitive.Item>
    )
  }
)

interface DropdownMenuContentProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(
  function DropdownMenuContent({ children, sideOffset = 8, align = 'start', className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          {...props}
          sideOffset={sideOffset}
          align={align}
          className={twMerge(
            'flex w-[258px] flex-col gap-1 rounded-md border border-neutral bg-surface-neutral p-2 shadow-[0_0_32px_rgba(0,0,0,0.08)] data-[state=open]:data-[side=bottom]:animate-slidein-down-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=top]:animate-slidein-up-md-faded',
            className
          )}
          ref={ref}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
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
      className={twMerge('my-1 h-[1px] w-full bg-surface-neutral-component', className)}
      ref={ref}
    />
  )
})

const DropdownMenu = Object.assign(
  {},
  {
    Root: DropdownMenuPrimitive.Root,
    Trigger: DropdownMenuPrimitive.Trigger,
    Content: DropdownMenuContent,
    Group: DropdownMenuPrimitive.Group,
    Item: DropdownMenuItem,
    Separator: DropdownMenuSeparator,
  }
)

export { DropdownMenu, dropdownMenuItemVariants }

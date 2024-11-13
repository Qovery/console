import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Slottable } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, type ReactElement, cloneElement, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const dropdownMenuItemVariants = cva(
  ['px-3', 'flex', 'items-center', 'h-8', 'text-sm', 'font-medium', 'rounded-sm', 'outline-none'],
  {
    variants: {
      color: {
        brand: [
          'data-[highlighted]:bg-brand-50',
          'data-[highlighted]:text-brand-500',
          'dark:data-[highlighted]:bg-neutral-400',
          'dark:text-neutral-100',
        ],
        red: ['data-[highlighted]:bg-red-50', 'data-[highlighted]:text-red-600'],
        yellow: ['data-[highlighted]:bg-neutral-150'],
      },
      disabled: {
        true: ['cursor-not-allowed'],
        false: ['cursor-pointer'],
      },
    },
    compoundVariants: [
      {
        color: 'brand',
        disabled: true,
        className: ['text-neutral-350'],
      },
      {
        color: 'brand',
        disabled: false,
        className: ['text-neutral-400', 'hover:bg-brand-50', 'hover:text-brand-500', 'dark:hover:bg-neutral-550'],
      },
      {
        color: 'red',
        disabled: true,
        className: ['text-red-400'],
      },
      {
        color: 'red',
        disabled: false,
        className: ['hover:bg-red-50', 'text-red-600'],
      },
      {
        color: 'yellow',
        disabled: false,
        className: ['hover:bg-neutral-150', 'text-neutral-400'],
      },
    ],
    defaultVariants: {
      color: 'brand',
      disabled: false,
    },
  }
)

const dropdownMenuItemIconVariants = cva(['text-sm', 'mr-3'], {
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
      className: ['text-brand-300'],
    },
    {
      color: 'brand',
      disabled: false,
      className: ['text-brand-500'],
    },
    {
      color: 'red',
      disabled: true,
      className: ['text-red-400'],
    },
    {
      color: 'red',
      disabled: false,
      className: ['text-red-600'],
    },
    {
      color: 'yellow',
      disabled: false,
      className: ['text-yellow-600'],
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
            'flex w-[258px] flex-col gap-1 rounded-md bg-neutral-50 p-2 shadow-[0_0_32px_rgba(0,0,0,0.08)] data-[state=open]:data-[side=bottom]:animate-slidein-up-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=top]:animate-slidein-down-md-faded dark:border dark:border-neutral-500 dark:bg-neutral-550',
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
      className={twMerge('my-1 h-[1px] w-full bg-neutral-200 dark:bg-neutral-600', className)}
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

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, type ReactElement, cloneElement, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const dropdownMenuItemVariants = cva(
  ['px-3', 'flex', 'items-center', 'h-9', 'text-sm', 'font-medium', 'rounded-sm', 'outline-none'],
  {
    variants: {
      color: {
        brand: [
          'text-neutral-400',
          'dark:text-neutral-100',
          'data-[highlighted]:bg-brand-50',
          'data-[highlighted]:text-brand-500',
        ],
        red: ['hover:bg-red-50', 'data-[highlighted]:bg-red-50', 'text-red-600', 'data-[highlighted]:text-red-600'],
      },
      disabled: {
        true: [],
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
        className: ['hover:bg-brand-50', 'hover:text-brand-500'],
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
      brand: ['text-brand-400'],
      red: ['text-red-600'],
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
        {children}
      </DropdownMenuPrimitive.Item>
    )
  }
)

interface DropdownMenuContentProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(
  function DropdownMenuContent({ children, sideOffset = 12, align = 'start', className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Portal>
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
          <DropdownMenuArrow />
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
    Content: DropdownMenuContent,
    Group: DropdownMenuPrimitive.Group,
    Item: DropdownMenuItem,
    Separator: DropdownMenuSeparator,
  }
)

export { DropdownMenu }

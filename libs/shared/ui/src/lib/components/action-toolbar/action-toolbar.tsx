import * as Toolbar from '@radix-ui/react-toolbar'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'

const toolbarButtonVariants = cva([], {
  variants: {
    variant: {
      outline: [],
      surface: [],
      solid: [],
      plain: [],
    },
    color: {
      brand: [],
      neutral: [],
      green: [],
      red: [],
      yellow: [],
    },
  },
  compoundVariants: [
    {
      variant: 'outline',
      color: 'neutral',
      className: [
        'first:rounded-l',
        'last:rounded-r',
        'first:border-r-0',
        'first:border-x',
        'border-l-0',
        'hover:[&:not(:active)]:border-neutral-250',
        'text-neutral-350',
        'hover:text-neutral-400',
        'data-[state=open]:text-neutral-400',
        'text-sm',
        'outline-0',
        'min-w-[36px]',
      ],
    },
    {
      variant: 'solid',
      color: 'brand',
      className: [
        'first:rounded-l',
        'last:rounded-r',
        'hover:bg-brand-600',
        'data-[state=open]:bg-brand-600',
        'text-sm',
        'outline-0',
        'min-w-[36px]',
      ],
    },
    {
      variant: 'outline',
      color: 'yellow',
      className: [
        'first:rounded-l',
        'last:rounded-r',
        'first:border-r-0',
        'first:border-x',
        'border-l-0',
        'border',
        'border-yellow-600',
        'text-yellow-600',
        'data-[state=open]:text-yellow-600',
        'text-sm',
        'outline-0',
        'min-w-[36px]',
      ],
    },
  ],
  defaultVariants: {},
})

interface ToolbarButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof Toolbar.Button>, 'color'>,
    VariantProps<typeof buttonVariants> {}

const ToolbarButton = forwardRef<ElementRef<typeof Toolbar.Button>, ToolbarButtonProps>(function Item(
  { children, className, color = 'neutral', radius = 'none', size = 'md', variant = 'outline', ...props },
  forwardedRef
) {
  return (
    <Toolbar.Button
      className={twMerge(
        buttonVariants({ color, radius, size, variant }),
        toolbarButtonVariants({ color, variant }),
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Toolbar.Button>
  )
})

const ActionToolbar = Object.assign(
  {},
  {
    Root: Toolbar.Root,
    Button: ToolbarButton,
  }
)

export { ActionToolbar }

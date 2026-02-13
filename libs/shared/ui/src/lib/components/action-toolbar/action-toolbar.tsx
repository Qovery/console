import * as Toolbar from '@radix-ui/react-toolbar'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'

const toolbarButtonVariants = cva(['active:scale-100'], {
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
      current: [],
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
        'hover:border-neutral-strong',
        'active:bg-surface-neutral-subtle',
        'data-[state=open]:bg-surface-neutral-subtle',
        'data-[state=open]:border-neutral-strong',
        'text-neutral-subtle',
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
        'first:border-r-0',
        'first:border-x',
        'border-l-0',
        'hover:border-brand-strong',
        'data-[state=open]:bg-surface-brand-solidHover',
        'data-[state=open]:border-brand-strong',
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
        'border-warning-component',
        'hover:border-warning-strong',
        'data-[state=open]:bg-surface-warning-subtle',
        'data-[state=open]:border-warning-strong',
        'text-warning',
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

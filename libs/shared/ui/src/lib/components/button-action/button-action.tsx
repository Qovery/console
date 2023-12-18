import * as Toolbar from '@radix-ui/react-toolbar'
import { type VariantProps } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'

interface ToolbarButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof Toolbar.Button>, 'color'>,
    VariantProps<typeof buttonVariants> {}

const ToolbarButton = forwardRef<ElementRef<typeof Toolbar.Button>, ToolbarButtonProps>(function Item(
  { children, className, color = 'neutral', radius = 'none', size, variant = 'outline', ...props },
  forwardedRef
) {
  return (
    <Toolbar.Button
      className={twMerge(
        buttonVariants({ color, radius, size, variant }),
        'first:rounded-l last:rounded-r first:border-r-0 first:border-x border-l-0 hover:[&:not(:active)]:border-neutral-250 text-neutral-350 hover:bg-neutral-150 hover:text-brand-400',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Toolbar.Button>
  )
})

const ButtonAction = Object.assign(
  {},
  {
    Root: Toolbar.Root,
    Button: ToolbarButton,
  }
)

export { ButtonAction }

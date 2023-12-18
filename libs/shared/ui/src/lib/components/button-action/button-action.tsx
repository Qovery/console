import * as Toolbar from '@radix-ui/react-toolbar'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import ButtonPrimitive from '../button-primitive/button-primitive'

interface ButtonItemProps extends ComponentPropsWithoutRef<typeof Toolbar.Button> {}

const Item = forwardRef<ElementRef<typeof Toolbar.Button>, ButtonItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Toolbar.Button {...props} ref={forwardedRef}>
      {children}
    </Toolbar.Button>
  )
)

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive> {}

/* 
  TODO: 
  Custom className should be removed to use a real variant from ButtonPrimitive.
  This will be done when we will have all button actions migrate.
*/
const Button = forwardRef<ElementRef<typeof ButtonPrimitive>, ButtonProps>(function Button(
  { className, ...props },
  forwardedRef
) {
  return (
    <ButtonPrimitive
      {...props}
      size="md"
      variant="outline"
      color="neutral"
      ref={forwardedRef}
      className={twMerge(
        'hover:[&:not(:active)]:border-neutral-250 text-neutral-350 hover:bg-neutral-150 hover:text-brand-400',
        className
      )}
    >
      {props.children}
    </ButtonPrimitive>
  )
})
const ButtonAction = Object.assign(
  {},
  {
    Root: Toolbar.Root,
    Item: Item,
    Button: Button,
  }
)

const ButtonActionRoot = Toolbar.Root

export { ButtonAction, ButtonActionRoot, Button, Item }

export type { ButtonItemProps, ButtonProps }

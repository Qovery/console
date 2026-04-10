import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {}

export const Kbd = forwardRef<ElementRef<'kbd'>, KbdProps>(function Kbd({ children, className }, ref) {
  return (
    <kbd
      ref={ref}
      className={twMerge(
        'flex h-4 w-4 items-center justify-center rounded-sm bg-surface-neutral-component text-xs text-neutral-subtle',
        className
      )}
    >
      {children}
    </kbd>
  )
})

export default Kbd

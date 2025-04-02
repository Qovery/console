import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {}

export const Kbd = forwardRef<ElementRef<'kbd'>, KbdProps>(function Kbd({ children, className }, ref) {
  return (
    <kbd
      ref={ref}
      className={twMerge('flex h-4 items-center rounded bg-neutral-150 px-1 text-xs text-neutral-350', className)}
    >
      {children}
    </kbd>
  )
})

export default Kbd

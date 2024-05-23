import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {}

export const Kbd = forwardRef<ElementRef<'kbd'>, KbdProps>(function Kbd({ children }, ref) {
  return (
    <kbd ref={ref} className="flex h-4 items-center rounded bg-neutral-150 px-1 text-xs text-neutral-350">
      {children}
    </kbd>
  )
})

export default Kbd

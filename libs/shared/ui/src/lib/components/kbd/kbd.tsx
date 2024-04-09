import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {}

export const Kbd = forwardRef<ElementRef<'kbd'>, KbdProps>(function Kbd({ children }, ref) {
  return (
    <kbd ref={ref} className="flex items-center px-1 rounded text-xs text-neutral-350 bg-neutral-150 h-4">
      {children}
    </kbd>
  )
})

export default Kbd

import { type ElementRef, type PropsWithChildren, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface SpinnerIconProps extends PropsWithChildren {
  className?: string
}

export const SpinnerIcon = forwardRef<ElementRef<'div'>, SpinnerIconProps>(function SpinnerIcon(
  { children, className = '' },
  forwardedRef
) {
  return (
    <div className={twMerge(`relative flex items-center justify-center w-4 h-4`, className)} ref={forwardedRef}>
      <div className="animate-spin absolute top-0 left-0 w-full h-full rounded-full border-[1.5px] border-current border-r-transparent" />
      {children && <div className="p-1">{children}</div>}
    </div>
  )
})

export default SpinnerIcon

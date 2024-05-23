import { type ElementRef, type PropsWithChildren, type SVGAttributes, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface SpinnerIconProps extends PropsWithChildren, SVGAttributes<SVGElement> {}

export const SpinnerIcon = forwardRef<ElementRef<'div'>, SpinnerIconProps>(function SpinnerIcon(
  { children, className = '' },
  forwardedRef
) {
  return (
    <div className={twMerge(`relative flex h-4 w-4 items-center justify-center`, className)} ref={forwardedRef}>
      <div className="absolute left-0 top-0 h-full w-full animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
      {children && <div className="p-1">{children}</div>}
    </div>
  )
})

export default SpinnerIcon

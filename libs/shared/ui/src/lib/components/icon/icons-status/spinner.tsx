import { type ElementRef, type ReactNode, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface SpinnerIconProps {
  children?: ReactNode
  className?: string
  width?: number | string
  height?: number | string
  borderWidth?: number | string
}

export const SpinnerIcon = forwardRef<ElementRef<'div'>, SpinnerIconProps>(function SpinnerIcon(
  { children, className = '', width = 16, height = 16, borderWidth = 1.5 },
  forwardedRef
) {
  return (
    <div
      className={twMerge(`relative flex items-center justify-center`, className)}
      style={{
        width: width,
        height: height,
      }}
      ref={forwardedRef}
    >
      <div
        className={`animate-spin absolute top-0 left-0 w-full h-full rounded-full border-[${borderWidth}px] border-current border-r-transparent`}
      />
      {children && <div className="p-1">{children}</div>}
    </div>
  )
})

export default SpinnerIcon

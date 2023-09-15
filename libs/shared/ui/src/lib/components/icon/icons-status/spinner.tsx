import { type ReactNode, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconProps } from '../icon'

type IconSpinnerProps = IconProps & {
  children?: ReactNode
}

export const SpinnerIcon = forwardRef<SVGSVGElement, IconSpinnerProps>(
  ({ color = 'currentColor', className = '', children, width = 16, height = 16, ...props }, forwardedRef) => {
    return (
      <div className={twMerge('relative', className)}>
        <svg
          className="animate-spin"
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
          ref={forwardedRef}
        >
          <path fill={color} d="M12 0A12 12 0 111.28 6.607l2.006 1.01A9.755 9.755 0 1012 2.244V0z" />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{children}</div>
      </div>
    )
  }
)

export default SpinnerIcon

import { forwardRef } from 'react'
import { type IconProps } from '../icon'

export const SpinnerIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', ...props }, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className="animate-spin"
        ref={forwardedRef}
      >
        <path fill={color} d="M12 0A12 12 0 111.28 6.607l2.006 1.01A9.755 9.755 0 1012 2.244V0z" />
      </svg>
    )
  }
)

export default SpinnerIcon

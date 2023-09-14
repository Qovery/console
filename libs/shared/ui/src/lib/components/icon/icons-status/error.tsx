import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'

export const ErrorIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 24, height = 24 }, forwardedRef) => {
    return (
      <div className={twMerge('text-red-500', className)} ref={forwardedRef}>
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 24a12 12 0 100-24 12 12 0 000 24zm1.125-18v7.5h-2.25V6h2.25zm-2.25 11.25V15h2.25v2.25h-2.25z"
          ></path>
        </svg>
      </div>
    )
  }
)

export default ErrorIcon

import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const CancelingIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 16, height = 16 }, forwardedRef) => {
    return (
      <div className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
        <SpinnerIcon width={width} height={height}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
            width="90%"
            height="90%"
            fill="none"
            viewBox="0 0 10 10"
          >
            <path
              fill="currentColor"
              d="M9.589 2L7.999.41 5 3.41l-3-3L.41 2l3 3-3 3L2 9.589l3-3 3 3 1.589-1.59-3-2.999 3-3z"
            ></path>
          </svg>
        </SpinnerIcon>
      </div>
    )
  }
)

export default CancelingIcon

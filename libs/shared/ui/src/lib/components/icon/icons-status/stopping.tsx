import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const StoppingIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 24, height = 24 }, forwardedRef) => {
    return (
      <div className={twMerge('text-brand-500', className)} ref={forwardedRef}>
        <SpinnerIcon width={width} height={height}>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
            <path fill="currentColor" d="M9.5.5v9h-9v-9h9z"></path>
          </svg>
        </SpinnerIcon>
      </div>
    )
  }
)

export default StoppingIcon

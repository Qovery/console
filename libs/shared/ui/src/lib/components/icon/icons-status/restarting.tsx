import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const RestartingIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 16, height = 16 }, forwardedRef) => {
    return (
      <div className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
        <SpinnerIcon width={width} height={height}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 12 12">
            <path
              fill="currentColor"
              d="M0 5.172V.207h1.655V2.36l.455-.455a5.792 5.792 0 018.193 0 5.792 5.792 0 010 8.192 5.792 5.792 0 01-8.193 0l1.172-1.171a4.138 4.138 0 100-5.852l-.445.444h2.128v1.655H0z"
            ></path>
          </svg>
        </SpinnerIcon>
      </div>
    )
  }
)

export default RestartingIcon

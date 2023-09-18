import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const DeletingIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 16, height = 16 }, forwardedRef) => {
    return (
      <div className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
        <SpinnerIcon width={width} height={height}>
          <svg className="mx-auto" xmlns="http://www.w3.org/2000/svg" width="90%" height="90%" viewBox="0 0 448 512">
            <path
              fill="currentColor"
              d="M163.8 0h120.4c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64s14.3-32 32-32h96l7.2-14.3C140.6 6.8 151.7 0 163.8 0zM32 128h384v320c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm111 111c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
            ></path>
          </svg>
        </SpinnerIcon>
      </div>
    )
  }
)

export default DeletingIcon

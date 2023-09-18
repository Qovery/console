import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const DeployingIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(function DeployingIcon(
  { className = '', width = 16, height = 16 },
  forwardedRef
) {
  return (
    <div className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
      <SpinnerIcon width={width} height={height}>
        <svg
          className="relative left-[1px] mx-auto scale-75"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
          viewBox="0 0 8 10"
        >
          <path fill="currentColor" d="M8 5l-8 5V0l8 5z"></path>
        </svg>
      </SpinnerIcon>
    </div>
  )
})

export default DeployingIcon

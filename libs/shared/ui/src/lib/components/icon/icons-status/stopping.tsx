import { type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'
import SpinnerIcon from './spinner'

export const StoppingIcon = forwardRef<ElementRef<typeof SpinnerIcon>, IconSVGProps>(function StoppingIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-300', className)} ref={forwardedRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="scale-90"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 10 10"
        {...props}
      >
        <path fill="currentColor" d="M9.5.5v9h-9v-9h9z"></path>
      </svg>
    </SpinnerIcon>
  )
})

export default StoppingIcon

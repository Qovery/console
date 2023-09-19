import { type ElementRef, type SVGAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinnerIcon from './spinner'

export const DeployingIcon = forwardRef<ElementRef<'div'>, SVGAttributes<SVGElement>>(function DeployingIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
      <svg
        className="relative left-[1px] mx-auto scale-75"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 8 10"
        {...props}
      >
        <path fill="currentColor" d="M8 5l-8 5V0l8 5z"></path>
      </svg>
    </SpinnerIcon>
  )
})

export default DeployingIcon

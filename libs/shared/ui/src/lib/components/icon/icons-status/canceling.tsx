import { type ElementRef, type SVGAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinnerIcon from './spinner'

export const CancelingIcon = forwardRef<ElementRef<'div'>, SVGAttributes<SVGElement>>(function CancelingIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto scale-90"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 10 10"
        {...props}
      >
        <path
          fill="currentColor"
          d="M9.589 2L7.999.41 5 3.41l-3-3L.41 2l3 3-3 3L2 9.589l3-3 3 3 1.589-1.59-3-2.999 3-3z"
        ></path>
      </svg>
    </SpinnerIcon>
  )
})

export default CancelingIcon

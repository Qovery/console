import { type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'
import SpinnerIcon from './spinner'

export const RestartingIcon = forwardRef<ElementRef<typeof SpinnerIcon>, IconSVGProps>(function RestartingIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-300', className)} ref={forwardedRef}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 12 12" {...props}>
        <path
          fill="currentColor"
          d="M0 5.172V.207h1.655V2.36l.455-.455a5.792 5.792 0 018.193 0 5.792 5.792 0 010 8.192 5.792 5.792 0 01-8.193 0l1.172-1.171a4.138 4.138 0 100-5.852l-.445.444h2.128v1.655H0z"
        ></path>
      </svg>
    </SpinnerIcon>
  )
})

export default RestartingIcon

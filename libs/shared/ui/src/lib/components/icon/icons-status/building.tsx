import { type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'
import SpinnerIcon from './spinner'

export const BuildingIcon = forwardRef<ElementRef<typeof SpinnerIcon>, IconSVGProps>(function BuildingIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-300', className)} ref={forwardedRef}>
      <svg width="100%" height="100%" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          fill="currentColor"
          d="M5.48333 1.18209L4.27778 1.91116L6.61111 3.0855V4.25984L9.33333 6.99997L9.91667 6.4128L10.5 6.99997L9.91667 7.58714L11.0833 8.76149L14 5.82563L12.8333 4.65129L12.25 5.23846L11.6667 4.65129L12.25 4.06412L9.8559 1.65427C9.27257 1.0671 8.48021 0.736816 7.65625 0.736816H7.08507C6.52118 0.736816 5.96701 0.890949 5.48333 1.18209ZM0 10.9144L2.33333 13.2631L8.03785 6.80425L6.41667 5.1724L0 10.9144Z"
        />
      </svg>
    </SpinnerIcon>
  )
})

export default BuildingIcon

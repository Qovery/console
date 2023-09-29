import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const StoppedIcon = forwardRef<SVGSVGElement, IconSVGProps>(function StoppedIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-neutral-300', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      ref={forwardedRef}
      {...props}
    >
      <g clipPath="url(#clip0_5424_5935)">
        <path
          fill="currentColor"
          d="M21.75 12a9.75 9.75 0 10-19.5 0 9.75 9.75 0 0019.5 0zM0 12a12 12 0 1124 0 12 12 0 01-24 0zm16.5-4.5v9h-9v-9h9z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_5424_5935">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default StoppedIcon

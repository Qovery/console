import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const UnknownIcon = forwardRef<SVGSVGElement, IconSVGProps>(function UnknownIcon(
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
      <g clipPath="url(#clip0_5911_150)">
        <path
          fill="currentColor"
          d="M21.75 12a9.75 9.75 0 10-19.5 0 9.75 9.75 0 0019.5 0zM0 12a12 12 0 1124 0 12 12 0 01-24 0zm7.875-3.375A2.627 2.627 0 0110.5 6h2.667a2.958 2.958 0 012.958 2.958c0 1.06-.567 2.039-1.486 2.569l-1.514.867V13.875h-2.25v-2.784l.567-.324 2.077-1.19a.709.709 0 00-.352-1.322H10.5a.376.376 0 00-.375.375v.304h-2.25v-.309zm3 7.125h2.25V18h-2.25v-2.25z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_5911_150">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default UnknownIcon

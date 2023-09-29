import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const WarningIcon = forwardRef<SVGSVGElement, IconSVGProps>(function WarningIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-yellow-600', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      ref={forwardedRef}
      {...props}
    >
      <g clipPath="url(#clip0_5949_100629)">
        <path
          fill="currentColor"
          d="M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM12 24a12 12 0 100-24 12 12 0 000 24zm1.125-18h-2.25v7.5h2.25V6zm-2.25 11.25h2.25V15h-2.25v2.25z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_5949_100629">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default WarningIcon

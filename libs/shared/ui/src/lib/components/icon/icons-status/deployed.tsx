import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const DeployedIcon = forwardRef<SVGSVGElement, IconSVGProps>(function DeployedIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-green-500', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      ref={forwardedRef}
      {...props}
    >
      <g clipPath="url(#clip0_5424_5921)">
        <path
          fill="currentColor"
          d="M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM12 24a12 12 0 100-24 12 12 0 000 24zm5.297-14.203L18.094 9 16.5 7.41l-.797.798L10.5 13.41l-2.203-2.203-.797-.797L5.91 12l.798.797 3 3 .797.797.797-.797 5.995-6z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_5424_5921">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default DeployedIcon

import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const RestartedIcon = forwardRef<SVGSVGElement, IconSVGProps>(function RestartedIcon(
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
      <g fill="currentColor" clipPath="url(#clip0_5424_5933)">
        <path d="M6 11.172V6.207h1.655V8.36l.455-.455a5.792 5.792 0 018.193 0 5.792 5.792 0 010 8.192 5.792 5.792 0 01-8.193 0l1.172-1.171a4.138 4.138 0 100-5.852l-.445.444h2.128v1.655H6z"></path>
        <path d="M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM12 24a12 12 0 100-24 12 12 0 000 24z"></path>
      </g>
      <defs>
        <clipPath id="clip0_5424_5933">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default RestartedIcon

import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const BuildErrorIcon = forwardRef<SVGSVGElement, IconSVGProps>(function BuildErrorIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-red-500', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      ref={forwardedRef}
      {...props}
    >
      <g clipPath="url(#clip0_5424_5942)">
        <path fill="currentColor" d="M12 24a12 12 0 100-24 12 12 0 000 24z"></path>
        <path
          fill="#fff"
          d="M10.483 6.182l-1.205.73 2.333 1.173V9.26L14.333 12l.584-.587.583.587-.583.587 1.166 1.175L19 10.825 17.833 9.65l-.583.588-.583-.588.583-.587-2.394-2.41a3.103 3.103 0 00-2.2-.917h-.57c-.565 0-1.119.154-1.603.445zM5 15.914l2.333 2.35 5.705-6.46-1.621-1.632L5 15.914z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_5424_5942">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default BuildErrorIcon

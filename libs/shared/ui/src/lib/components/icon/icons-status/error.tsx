import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const ErrorIcon = forwardRef<SVGSVGElement, IconSVGProps>(function ErrorIcon(
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
      <path
        fill="currentColor"
        d="M12 24a12 12 0 100-24 12 12 0 000 24zm1.125-18v7.5h-2.25V6h2.25zm-2.25 11.25V15h2.25v2.25h-2.25z"
      ></path>
    </svg>
  )
})

export default ErrorIcon

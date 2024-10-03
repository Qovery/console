import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const SkipIcon = forwardRef<SVGSVGElement, IconSVGProps>(function SkipIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <span className={twMerge('block rounded-full border border-neutral-300 text-neutral-300', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          d="M6.5 16.65a.44.44 0 00.694.36l6.588-4.65a.44.44 0 000-.72L7.194 6.99a.44.44 0 00-.694.36v9.3zM16.107 6.5a.44.44 0 00-.44.44v10.12c0 .243.197.44.44.44h.953a.44.44 0 00.44-.44V6.94a.44.44 0 00-.44-.44h-.953z"
        ></path>
      </svg>
    </span>
  )
})

export default SkipIcon

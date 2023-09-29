import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const QueuedIcon = forwardRef<SVGSVGElement, IconSVGProps>(function QueuedIcon(
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
      viewBox="0 0 16 16"
      ref={forwardedRef}
      {...props}
    >
      <path fill="currentColor" d="M8 1.5V8H1.5c0-3.59 2.91-6.5 6.5-6.5zM16 8A8 8 0 100 8a8 8 0 0016 0z"></path>
    </svg>
  )
})

export default QueuedIcon

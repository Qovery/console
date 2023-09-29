import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon'

export const DeletedIcon = forwardRef<SVGSVGElement, IconSVGProps>(function DeletedIcon(
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
      <g fill="#A0AFC5" clipPath="url(#clip0_5937_4698)">
        <path d="M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM12 24a12 12 0 100-24 12 12 0 000 24z"></path>
        <path d="M10.587 6h2.826c.284 0 .545.16.672.415l.169.335h2.254a.75.75 0 110 1.5H7.492a.75.75 0 110-1.5h2.254l.17-.335a.748.748 0 01.67-.415zM7.492 9h9.016v7.5c0 .827-.674 1.5-1.503 1.5h-6.01a1.503 1.503 0 01-1.503-1.5V9zm2.606 2.602a.56.56 0 000 .794l1.104 1.102-1.104 1.101a.56.56 0 000 .795c.22.218.578.22.796 0l1.104-1.102 1.103 1.102a.562.562 0 10.796-.795l-1.103-1.101 1.103-1.102a.56.56 0 000-.794.564.564 0 00-.796 0l-1.103 1.101-1.104-1.101a.562.562 0 00-.796 0z"></path>
      </g>
      <defs>
        <clipPath id="clip0_5937_4698">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
})

export default DeletedIcon

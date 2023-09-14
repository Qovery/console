import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'

export const CanceledIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 24, height = 24 }, forwardedRef) => {
    return (
      <div className={twMerge('text-neutral-300', className)} ref={forwardedRef}>
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM12 24a12 12 0 100-24 12 12 0 000 24zm4.59-15L15 7.41l-.797.798L12 10.41 9.797 8.208 9 7.41 7.41 9l.798.797L10.41 12l-2.203 2.203L7.41 15 9 16.59l.797-.798L12 13.59l2.203 2.203.797.797L16.59 15l-.798-.797L13.59 12l2.203-2.203L16.59 9z"
          ></path>
        </svg>
      </div>
    )
  }
)

export default CanceledIcon

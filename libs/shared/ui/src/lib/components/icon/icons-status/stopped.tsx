import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'

export const StoppedIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(function StoppedIcon(
  { className = '', width = 16, height = 16 },
  forwardedRef
) {
  return (
    <div className={twMerge('text-neutral-300', className)} ref={forwardedRef}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_5424_5935)">
          <path
            fill="currentColor"
            d="M21.75 12a9.75 9.75 0 10-19.5 0 9.75 9.75 0 0019.5 0zM0 12a12 12 0 1124 0 12 12 0 01-24 0zm16.5-4.5v9h-9v-9h9z"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_5424_5935">
            <path fill="#fff" d="M0 0H24V24H0z"></path>
          </clipPath>
        </defs>
      </svg>
    </div>
  )
})

export default StoppedIcon

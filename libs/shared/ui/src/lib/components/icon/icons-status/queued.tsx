import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const QueuedIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(
  ({ className = '', width = 24, height = 24 }, forwardedRef) => {
    return (
      <div className={twMerge('text-brand-500', className)} ref={forwardedRef}>
        <SpinnerIcon width={width} height={height} />
      </div>
    )
  }
)

export default QueuedIcon

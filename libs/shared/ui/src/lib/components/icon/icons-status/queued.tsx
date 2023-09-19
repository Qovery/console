import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconStatusProps } from '../icon'
import SpinnerIcon from './spinner'

export const QueuedIcon = forwardRef<ElementRef<'div'>, IconStatusProps>(function QueuedIcon(
  { className = '' },
  forwardedRef
) {
  return (
    <div className={twMerge('text-brand-500 dark:text-brand-400', className)} ref={forwardedRef}>
      <SpinnerIcon />
    </div>
  )
})

export default QueuedIcon

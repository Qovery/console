import { type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinnerIcon from './spinner'

export const QueuedIcon = forwardRef<ElementRef<'div'>, { className?: string }>(function QueuedIcon(
  { className = '' },
  forwardedRef
) {
  return <SpinnerIcon className={twMerge('text-brand-500 dark:text-brand-300', className)} ref={forwardedRef} />
})

export default QueuedIcon

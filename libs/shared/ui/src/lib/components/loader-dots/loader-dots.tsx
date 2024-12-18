import { twMerge } from '@qovery/shared/util-js'

export interface LoaderDotsProps {
  className?: string
}

export function LoaderDots({ className }: LoaderDotsProps) {
  return (
    <span
      className={twMerge(
        'relative -left-[120px] inline-block h-2.5 w-2.5 animate-loader-dots rounded-full text-neutral-900 dark:text-neutral-250',
        className
      )}
    />
  )
}

export default LoaderDots

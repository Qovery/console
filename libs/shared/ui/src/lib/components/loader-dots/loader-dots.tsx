import { twMerge } from '@qovery/shared/util-js'

export interface LoaderDotsProps {
  className?: string
}

export function LoaderDots({ className }: LoaderDotsProps) {
  return (
    <span
      className={twMerge('relative -left-[120px] inline-block h-2.5 w-2.5 animate-loader-dots rounded-full', className)}
    />
  )
}

export default LoaderDots

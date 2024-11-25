import clsx from 'clsx'
import { type ElementRef, type PropsWithChildren, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface SkeletonProps extends PropsWithChildren {
  width?: number
  height?: number
  show?: boolean
  rounded?: boolean
  square?: boolean
  truncate?: boolean
  className?: string
}

export const Skeleton = forwardRef<ElementRef<'div'>, SkeletonProps>(function Skeleton(
  { children, show = true, width, height, rounded, square, truncate, className },
  forwardedRef
) {
  return (
    <div
      ref={forwardedRef}
      aria-busy={show}
      className={twMerge(
        clsx('flex', {
          truncate: truncate,
          'block animate-pulse bg-gradient-to-r from-[#f8f9fc] via-[#e2e9f3] to-[#f8f9fc] bg-[length:400%_100%] duration-[6s] dark:from-[#2A3041] dark:via-[#1F2637] dark:to-[#1F2637]':
            show,
          rounded: !rounded && !square,
        }),
        className
      )}
      style={{
        width: show ? width : '',
        height: show ? height : '',
        borderRadius: rounded ? '100%' : square ? '0' : '',
      }}
    >
      {!show && children}
    </div>
  )
})

export default Skeleton

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
  { children, show = true, width, height, rounded, square, truncate, className = '' },
  forwardedRef
) {
  return (
    <div
      ref={forwardedRef}
      data-testid="skeleton"
      className={twMerge(
        `skeleton ${truncate ? 'truncate' : ''} ${!show ? 'skeleton--loaded' : ''} ${
          rounded || square ? '' : 'rounded'
        }`,
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

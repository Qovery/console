import React from 'react'

export interface SkeletonProps {
  children: React.ReactElement
  width?: number
  height?: number
  show?: boolean
  rounded?: boolean
  square?: boolean
  truncate?: boolean
}

export function Skeleton(props: SkeletonProps) {
  const { children, show = true, width, height, rounded, square, truncate } = props

  return (
    <div
      className={`skeleton ${truncate ? 'truncate' : ''} ${!show ? 'skeleton--loaded' : ''} ${
        rounded || square ? '' : 'rounded'
      }`}
      style={{
        width: show ? width : '',
        height: show ? height : '',
        borderRadius: rounded ? '100%' : square ? '0' : '',
      }}
      data-testid="skeleton"
    >
      {!show && children}
    </div>
  )
}

export default Skeleton

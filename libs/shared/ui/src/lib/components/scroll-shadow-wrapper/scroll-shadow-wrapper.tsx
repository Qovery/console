import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'

export interface ScrollShadowWrapperProps {
  children: ReactNode
  className?: string
}

export function ScrollShadowWrapper(props: ScrollShadowWrapperProps) {
  const { children, className = '' } = props

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  // todo remove any here and fix types
  const onScrollHandler = (event: any) => {
    setScrollTop(event.currentTarget.scrollTop)
    setScrollHeight(event.currentTarget.scrollHeight)
    setClientHeight(event.currentTarget.clientHeight)
  }

  const resetRefSizes = (ref: RefObject<HTMLDivElement>) => {
    if (!ref.current) return

    setScrollTop(ref.current.scrollTop)
    setScrollHeight(ref.current.scrollHeight)
    setClientHeight(ref.current.clientHeight)
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    resetRefSizes(wrapperRef)
  }, [wrapperRef?.current?.clientHeight, resetRefSizes])

  useEffect(() => {
    const current = wrapperRef.current
    if (current) {
      current.addEventListener('wheel', onScrollHandler)
    }

    return () => {
      if (current) {
        current.removeEventListener('wheel', onScrollHandler)
      }
    }
  }, [wrapperRef])

  const getVisibleSides = (): { top: boolean; bottom: boolean } => {
    const isBottom = clientHeight === scrollHeight - scrollTop
    const isTop = scrollTop === 0
    const isBetween = scrollTop > 0 && clientHeight < scrollHeight - scrollTop

    return {
      top: (isBottom || isBetween) && !(isTop && isBottom),
      bottom: (isTop || isBetween) && !(isTop && isBottom),
    }
  }

  return (
    <div ref={wrapperRef} className={`relative overflow-auto ${className}`} onScroll={onScrollHandler}>
      <div
        className={`sticky top-0 bg-scroll-shadow-up w-full h-4 -mb-4 transition-opacity duration-300 ${
          getVisibleSides().top ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
      <div
        className={`sticky bottom-0 bg-scroll-shadow-bottom w-full h-4 -mt-4 rotate-180 transition-opacity duration-300 ${
          getVisibleSides().bottom ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default ScrollShadowWrapper

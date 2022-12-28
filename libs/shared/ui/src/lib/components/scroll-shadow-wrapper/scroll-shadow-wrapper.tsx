import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'

export interface ScrollShadowWrapperProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function ScrollShadowWrapper(props: ScrollShadowWrapperProps) {
  const { children, className = '', style = {} } = props

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const onScrollHandler = (event: React.WheelEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
    setScrollHeight(event.currentTarget.scrollHeight)
    setClientHeight(event.currentTarget.clientHeight)
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resetRefSizes = (ref: RefObject<HTMLDivElement>) => {
      if (!ref.current) return

      setScrollTop(ref.current.scrollTop)
      setScrollHeight(ref.current.scrollHeight)
      setClientHeight(ref.current.clientHeight)
    }

    resetRefSizes(wrapperRef)
  }, [wrapperRef?.current?.clientHeight])

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
    <div
      data-testid="scroll-shadow-wrapper"
      ref={wrapperRef}
      style={style}
      className={`relative overflow-y-auto pr-[1px] ${className}`}
      onScroll={onScrollHandler}
    >
      <div
        data-testid="scroll-shadow-top"
        className={`sticky top-0 bg-scroll-shadow-up w-full h-4 -mb-4 transition-opacity duration-300 ${
          getVisibleSides().top ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
      <div
        data-testid="scroll-shadow-bottom"
        className={`sticky bottom-0 bg-scroll-shadow-bottom w-full h-4 -mt-4 rotate-180 transition-opacity duration-300 ${
          getVisibleSides().bottom ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default ScrollShadowWrapper

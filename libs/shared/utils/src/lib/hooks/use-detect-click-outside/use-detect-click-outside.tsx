import React, { useRef, useEffect, RefObject } from 'react'

export interface UseDetectOutsideProps {
  callback: () => void
  children: React.ReactElement
  event?: string
  className?: string
}

// Hook that alerts clicks outside of the passed ref
function useDetectClickOutside(ref: RefObject<HTMLElement>, callback: () => void, event = 'click') {
  // Alert if clicked on outside of element
  function handleClickOutside(event: Event) {
    const target = event.target as HTMLElement

    if (ref.current && !ref.current.contains(target)) {
      callback()
    }
  }

  useEffect(() => {
    // Bind the event listener
    document.addEventListener(event, handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener(event, handleClickOutside)
    }
  })
}

// Component that alerts if you click outside of it
export function DetectClickOutside(props: UseDetectOutsideProps) {
  const { callback, event, className = '', children } = props
  const wrapperRef = useRef<HTMLDivElement>(null)
  useDetectClickOutside(wrapperRef, callback, event)

  return (
    <div aria-label="click-outside-container" className={className} ref={wrapperRef}>
      {children}
    </div>
  )
}

export default DetectClickOutside

import { useEffect, useRef } from 'react'

export function ScrollIntoView() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  return <span ref={ref} />
}

export default ScrollIntoView

import { useCallback, useEffect, useRef, useState } from 'react'

const FADE_BOTH = '[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]'
const FADE_START = '[mask-image:linear-gradient(to_right,transparent,black_24px)]'
const FADE_END = '[mask-image:linear-gradient(to_left,transparent,black_24px)]'

// For horizontally scrollable containers (tab bars, wide tables on phones): fades the edges that hide content, so
// people can tell there is more to scroll. Nothing is applied when the content fits, which is the desktop case.
export function useHorizontalOverflowFade<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [overflow, setOverflow] = useState({ start: false, end: false })

  const update = useCallback(() => {
    const element = ref.current
    if (!element) return
    const start = element.scrollLeft > 1
    const end = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    setOverflow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [update])

  const fadeClassName =
    overflow.start && overflow.end ? FADE_BOTH : overflow.start ? FADE_START : overflow.end ? FADE_END : ''

  return { ref, onScroll: update, update, fadeClassName }
}

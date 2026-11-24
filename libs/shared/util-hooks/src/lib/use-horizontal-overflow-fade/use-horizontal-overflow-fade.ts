import { useCallback, useEffect, useRef, useState } from 'react'

// Edge fades are a phone affordance: wide tables still overflow on small desktops, which must keep their look
const FADE_BOTH_CLASS_NAME =
  'max-md:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]'
const FADE_START_CLASS_NAME = 'max-md:[mask-image:linear-gradient(to_right,transparent,black_24px)]'
const FADE_END_CLASS_NAME = 'max-md:[mask-image:linear-gradient(to_left,transparent,black_24px)]'

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
    const observeChildren = () => {
      observer.disconnect()
      observer.observe(element)
      Array.from(element.children).forEach((child) => observer.observe(child))
      update()
    }

    observeChildren()
    const childrenObserver = new MutationObserver(observeChildren)
    childrenObserver.observe(element, { childList: true })
    return () => {
      childrenObserver.disconnect()
      observer.disconnect()
    }
  }, [update])

  const fadeClassName =
    overflow.start && overflow.end
      ? FADE_BOTH_CLASS_NAME
      : overflow.start
        ? FADE_START_CLASS_NAME
        : overflow.end
          ? FADE_END_CLASS_NAME
          : ''

  return { ref, update, fadeClassName }
}

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tracks the viewport-relative bottom edge of a sticky element inside a scrollable container.
 *
 * Useful to position a portaled, fixed-position panel right below a sticky header/navbar
 * without hardcoding heights or duplicating scroll listeners in components.
 *
 * Returns a callback ref to attach to the sticky target and the current measured offset (px).
 * The offset is `undefined` until the target mounts or when it unmounts.
 */
export function useStickyBottomOffset(
  scrollContainerRef: RefObject<HTMLElement | null>
): readonly [(node: HTMLElement | null) => void, number | undefined] {
  const targetRef = useRef<HTMLElement | null>(null)
  const [offset, setOffset] = useState<number>()

  const measure = useCallback(() => {
    const target = targetRef.current

    if (!target) {
      setOffset(undefined)
      return
    }

    const next = Math.max(0, Math.round(target.getBoundingClientRect().bottom))
    setOffset((previous) => (previous === next ? previous : next))
  }, [])

  const setTargetRef = useCallback(
    (node: HTMLElement | null) => {
      targetRef.current = node
      measure()
    },
    [measure]
  )

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current

    if (!scrollContainer) {
      return
    }

    let rafId: number | null = null

    const schedule = () => {
      if (rafId !== null) return

      rafId = window.requestAnimationFrame(() => {
        rafId = null
        measure()
      })
    }

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resizeObserver?.observe(scrollContainer)

    if (targetRef.current) {
      resizeObserver?.observe(targetRef.current)
    }

    scrollContainer.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    measure()

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)

      scrollContainer.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver?.disconnect()
    }
  }, [scrollContainerRef, measure])

  return [setTargetRef, offset] as const
}

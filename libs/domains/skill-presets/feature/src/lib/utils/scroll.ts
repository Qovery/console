/** Smooth scrolling, unless the user asked the system to reduce motion. */
export function scrollToElement(element: Element | null | undefined, block: ScrollLogicalPosition = 'center') {
  if (!element) return
  const reduceMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block })
}

export interface ScrollIntoViewHorizontallyOptions {
  // `start` aligns the element on the container's left edge, `nearest` only scrolls when it is cut off
  align: 'start' | 'nearest'
  // Space kept between the element and the container edge, in px
  margin: number
}

// Scrolls a horizontal scroll container so that `element` is visible, without moving the page like scrollIntoView
export function scrollIntoViewHorizontally(
  container: HTMLElement,
  element: HTMLElement,
  { align, margin }: ScrollIntoViewHorizontallyOptions
) {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  if (align === 'start') {
    container.scrollLeft = Math.max(0, container.scrollLeft + elementRect.left - containerRect.left - margin)
  } else if (elementRect.right > containerRect.right) {
    container.scrollLeft += elementRect.right - containerRect.right + margin
  } else if (elementRect.left < containerRect.left) {
    container.scrollLeft -= containerRect.left - elementRect.left + margin
  }
}

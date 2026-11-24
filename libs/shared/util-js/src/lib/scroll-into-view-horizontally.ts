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

  // An element wider than the container cannot fit: show its start, so repeated calls give the same result
  const isWiderThanContainer = elementRect.right - elementRect.left > containerRect.right - containerRect.left

  if (align === 'start' || isWiderThanContainer) {
    container.scrollLeft = Math.max(0, container.scrollLeft + elementRect.left - containerRect.left - margin)
  } else if (elementRect.right > containerRect.right) {
    container.scrollLeft += Math.min(
      elementRect.right - containerRect.right + margin,
      elementRect.left - containerRect.left
    )
  } else if (elementRect.left < containerRect.left) {
    container.scrollLeft -= Math.min(
      containerRect.left - elementRect.left + margin,
      containerRect.right - elementRect.right
    )
  }
}

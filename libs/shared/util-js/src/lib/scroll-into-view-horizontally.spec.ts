/**
 * @jest-environment jsdom
 */
import { scrollIntoViewHorizontally } from './scroll-into-view-horizontally'

function setup({
  scrollLeft,
  elementLeft,
  elementWidth,
}: {
  scrollLeft: number
  elementLeft: number
  elementWidth: number
}) {
  const container = document.createElement('div')
  const element = document.createElement('div')
  container.scrollLeft = scrollLeft
  container.getBoundingClientRect = () => ({ left: 0, right: 300 }) as DOMRect
  element.getBoundingClientRect = () => ({ left: elementLeft, right: elementLeft + elementWidth }) as DOMRect
  return { container, element }
}

describe('scrollIntoViewHorizontally', () => {
  it('aligns the element on the left edge, keeping the margin', () => {
    const { container, element } = setup({ scrollLeft: 0, elementLeft: 500, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'start', margin: 24 })
    expect(container.scrollLeft).toBe(476)
  })

  it('adds the current scroll offset when aligning', () => {
    const { container, element } = setup({ scrollLeft: 80, elementLeft: 500, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'start', margin: 24 })
    expect(container.scrollLeft).toBe(556)
  })

  it('shows the start of an element wider than the container, on every call', () => {
    const { container, element } = setup({ scrollLeft: 0, elementLeft: 200, elementWidth: 400 })
    scrollIntoViewHorizontally(container, element, { align: 'nearest', margin: 16 })
    expect(container.scrollLeft).toBe(184)
  })

  it('never scrolls before the start when aligning', () => {
    const { container, element } = setup({ scrollLeft: 0, elementLeft: 10, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'start', margin: 24 })
    expect(container.scrollLeft).toBe(0)
  })

  it('scrolls right just enough when the element is cut off on the right', () => {
    const { container, element } = setup({ scrollLeft: 0, elementLeft: 250, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'nearest', margin: 16 })
    expect(container.scrollLeft).toBe(66)
  })

  it('scrolls left when the element is cut off on the left', () => {
    const { container, element } = setup({ scrollLeft: 100, elementLeft: -40, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'nearest', margin: 16 })
    expect(container.scrollLeft).toBe(44)
  })

  it('does not scroll when the element is already visible', () => {
    const { container, element } = setup({ scrollLeft: 50, elementLeft: 100, elementWidth: 100 })
    scrollIntoViewHorizontally(container, element, { align: 'nearest', margin: 16 })
    expect(container.scrollLeft).toBe(50)
  })
})

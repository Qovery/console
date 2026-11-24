/**
 * @jest-environment jsdom
 */
import { scrollToElement } from './scroll-to-element'

describe('scrollToElement', () => {
  const matchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = matchMedia
  })

  it('scrolls smoothly to the element', () => {
    const element = document.createElement('div')
    element.scrollIntoView = jest.fn()
    window.matchMedia = jest.fn().mockReturnValue({ matches: false })

    scrollToElement(element)

    expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
  })

  it('jumps without animation when the user asked to reduce motion', () => {
    const element = document.createElement('div')
    element.scrollIntoView = jest.fn()
    window.matchMedia = jest.fn().mockReturnValue({ matches: true })

    scrollToElement(element, 'start')

    expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
  })

  it('does nothing without an element', () => {
    expect(() => scrollToElement(null)).not.toThrow()
  })
})

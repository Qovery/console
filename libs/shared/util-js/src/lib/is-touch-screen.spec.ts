/**
 * @jest-environment jsdom
 */
import { isTouchScreen } from './is-touch-screen'

describe('isTouchScreen', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns true when the primary pointer is coarse', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia

    expect(isTouchScreen()).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(pointer: coarse)')
  })

  it('returns false when the primary pointer is fine', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia

    expect(isTouchScreen()).toBe(false)
  })

  it('returns false when matchMedia is not available', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia

    expect(isTouchScreen()).toBe(false)
  })
})

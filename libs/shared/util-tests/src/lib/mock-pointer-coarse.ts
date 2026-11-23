// Makes `matchMedia('(pointer: coarse)')` match, as on a touch screen. Returns a function restoring the original.
export function mockPointerCoarse(coarse = true) {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: coarse && query === '(pointer: coarse)',
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia
  return () => {
    window.matchMedia = originalMatchMedia
  }
}

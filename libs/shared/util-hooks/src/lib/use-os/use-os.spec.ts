import { renderHook } from '@testing-library/react'
import { detectOS, useOS } from './use-os'

describe('detectOS', () => {
  let userAgentGetter: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
  })

  afterEach(() => {
    userAgentGetter.mockRestore()
  })

  it('should detect Windows from the user agent', () => {
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')

    expect(detectOS()).toBe('windows')
  })

  it('should detect macOS from the user agent', () => {
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')

    expect(detectOS()).toBe('macos')
  })

  it('should return Linux when the user agent is not Windows or macOS', () => {
    userAgentGetter.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64)')

    expect(detectOS()).toBe('linux')
  })

  it('should default to macOS when navigator is unavailable', () => {
    const originalNavigator = global.navigator

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: undefined,
    })

    try {
      expect(detectOS()).toBe('macos')
    } finally {
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: originalNavigator,
      })
    }
  })
})

describe('useOS', () => {
  let userAgentGetter: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
  })

  afterEach(() => {
    userAgentGetter.mockRestore()
  })

  it('should return the detected OS', () => {
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')

    const { result } = renderHook(() => useOS())

    expect(result.current).toBe('windows')
  })
})

import { renderHook } from '@testing-library/react'
import { useFormatHotkeys } from './use-format-hotkeys'

describe('useFormatHotkeys', () => {
  let UserAgentGetter: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    UserAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
  })

  it('should return the correct hotkeys for meta Windows', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('meta+k'))
    expect(result.current).toBe('Ctrl + K')
  })

  it('should return the correct hotkeys for meta Mac OS', () => {
    UserAgentGetter.mockReturnValue('Mac OS')
    const { result } = renderHook(() => useFormatHotkeys('meta+k'))
    expect(result.current).toBe('⌘ + K')
  })

  it('should return the correct hotkeys for alt Windows', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('alt+k'))
    expect(result.current).toBe('Alt + K')
  })

  it('should return the correct hotkeys for alt Mac OS', () => {
    UserAgentGetter.mockReturnValue('Mac OS')
    const { result } = renderHook(() => useFormatHotkeys('alt+k'))
    expect(result.current).toBe('⌥ + K')
  })

  it('should return the correct hotkeys for ctrl Windows', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('ctrl+k'))
    expect(result.current).toBe('Ctrl + K')
  })

  it('should return the correct hotkeys for ctrl Mac OS', () => {
    UserAgentGetter.mockReturnValue('Mac OS')
    const { result } = renderHook(() => useFormatHotkeys('ctrl+k'))
    expect(result.current).toBe('Ctrl + K')
  })

  it('should return the correct hotkeys for shift', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('shift+k'))
    expect(result.current).toBe('⇧ + K')
  })

  it('should return the correct hotkeys for enter', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('enter+k'))
    expect(result.current).toBe('⏎ + K')
  })

  it('should return the correct hotkeys for any key', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('a+k'))
    expect(result.current).toBe('A + K')
  })

  it('should return the correct simple hotkey for meta Windows', () => {
    UserAgentGetter.mockReturnValue('Win or any other')
    const { result } = renderHook(() => useFormatHotkeys('meta'))
    expect(result.current).toBe('Ctrl')
  })
})

import { renderHook } from '@testing-library/react'
import { useIntervalTick } from './use-interval-tick'

describe('useIntervalTick', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should trigger re-renders every second by default', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval')
    const { unmount } = renderHook(() => useIntervalTick())

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    unmount()
    setIntervalSpy.mockRestore()
  })

  it('should not start interval when enabled is false', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval')
    const { unmount } = renderHook(() => useIntervalTick(false))

    expect(setIntervalSpy).not.toHaveBeenCalled()
    unmount()
    setIntervalSpy.mockRestore()
  })

  it('should clear interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => useIntervalTick())

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('should start interval when enabled changes from false to true', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval')
    const { rerender, unmount } = renderHook(({ enabled }: { enabled: boolean }) => useIntervalTick(enabled), {
      initialProps: { enabled: false },
    })

    expect(setIntervalSpy).not.toHaveBeenCalled()

    rerender({ enabled: true })

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    unmount()
    setIntervalSpy.mockRestore()
  })

  it('should clear interval when enabled changes from true to false', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const { rerender, unmount } = renderHook(({ enabled }: { enabled: boolean }) => useIntervalTick(enabled), {
      initialProps: { enabled: true },
    })

    rerender({ enabled: false })

    expect(clearIntervalSpy).toHaveBeenCalled()
    unmount()
    clearIntervalSpy.mockRestore()
  })

  it('should respect a custom interval duration', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval')
    const { unmount } = renderHook(() => useIntervalTick(true, 500))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500)
    unmount()
    setIntervalSpy.mockRestore()
  })
})

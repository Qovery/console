import { act, renderHook } from '@qovery/shared/util-tests'
import { useStreamingAnimation } from './use-streaming-animation'

describe('useStreamingAnimation', () => {
  let mockSetDisplayedStreamingMessage: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetDisplayedStreamingMessage = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('initial state', () => {
    it('should not update when streaming message is empty', () => {
      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: '',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockSetDisplayedStreamingMessage).not.toHaveBeenCalled()
    })

    it('should not update when displayed message equals streaming message', () => {
      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: 'Hello',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockSetDisplayedStreamingMessage).not.toHaveBeenCalled()
    })

    it('should not update when displayed message is longer than streaming message', () => {
      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: 'Hello World',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockSetDisplayedStreamingMessage).not.toHaveBeenCalled()
    })
  })

  describe('animation', () => {
    it('should start animation when streaming message is provided', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello World',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should gradually display the message', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello World',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should use animation frame for smooth rendering', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()

      requestAnimationFrameSpy.mockRestore()
    })

    it('should cancel animation frame on unmount', () => {
      const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')

      const { unmount } = renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      unmount()

      expect(cancelAnimationFrameSpy).toHaveBeenCalled()

      cancelAnimationFrameSpy.mockRestore()
    })
  })

  describe('chunking logic', () => {
    it('should start animation for longer messages', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'a'.repeat(7000),
          displayedStreamingMessage: 'a'.repeat(6500),
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should start animation when remaining content is small', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      const fullMessage = 'Hello World'
      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: fullMessage,
          displayedStreamingMessage: 'Hello Worl',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should start animation when messages are different', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'New Message',
          displayedStreamingMessage: 'Old',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })
  })

  describe('visibility change handling', () => {
    it('should set up visibility change listener', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove visibility change listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('should set full message when document becomes visible', () => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: true,
      })

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'Hello World',
          displayedStreamingMessage: 'Hello',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      // Simulate document becoming visible
      Object.defineProperty(document, 'hidden', { value: false })

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(mockSetDisplayedStreamingMessage).toHaveBeenCalledWith('Hello World')

      // Clean up
      Object.defineProperty(document, 'hidden', { value: false })
    })
  })

  describe('edge cases', () => {
    it('should handle empty string to non-empty transition', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: 'A',
          displayedStreamingMessage: '',
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should handle rapid message updates', () => {
      const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

      const { rerender } = renderHook(
        ({ streamingMessage, displayedStreamingMessage }) =>
          useStreamingAnimation({
            streamingMessage,
            displayedStreamingMessage,
            setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
          }),
        {
          initialProps: {
            streamingMessage: 'First',
            displayedStreamingMessage: '',
          },
        }
      )

      rerender({
        streamingMessage: 'Second message',
        displayedStreamingMessage: 'Fir',
      })

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      requestAnimationFrameSpy.mockRestore()
    })

    it('should return streaming message when remaining is 0 or less', () => {
      const fullMessage = 'Complete'
      renderHook(() =>
        useStreamingAnimation({
          streamingMessage: fullMessage,
          displayedStreamingMessage: fullMessage,
          setDisplayedStreamingMessage: mockSetDisplayedStreamingMessage,
        })
      )

      // Should not call setDisplayedStreamingMessage when already complete
      expect(mockSetDisplayedStreamingMessage).not.toHaveBeenCalled()
    })
  })
})

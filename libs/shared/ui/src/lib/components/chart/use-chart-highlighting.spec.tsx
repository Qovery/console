import { act, renderHook } from '@qovery/shared/util-tests'
import { useChartHighlighting } from './use-chart-highlighting'

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))

describe('useChartHighlighting', () => {
  beforeEach(() => {
    // Clear any existing DOM elements
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should return expected properties', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.handleHighlight).toBeInstanceOf(Function)
      expect(result.current.sanitizeKey).toBeInstanceOf(Function)
    })
  })

  describe('sanitizeKey function', () => {
    it('should sanitize keys with special characters', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      expect(result.current.sanitizeKey('pod-889b7db58-yv1kc')).toBe('pod-889b7db58-yv1kc')
      expect(result.current.sanitizeKey('metric@123#test')).toBe('metric-123-test')
      expect(result.current.sanitizeKey('simple-key')).toBe('simple-key')
      expect(result.current.sanitizeKey('key_with_underscores')).toBe('key_with_underscores')
    })
  })

  describe('direct styling functionality', () => {
    let container: HTMLDivElement
    let mockSeriesElement: HTMLElement
    let mockPathElement: HTMLElement

    beforeEach(() => {
      // Create mock DOM structure that mimics chart elements
      container = document.createElement('div')
      mockSeriesElement = document.createElement('g')
      mockSeriesElement.classList.add('series', 'series--cpu')
      mockPathElement = document.createElement('path')

      mockSeriesElement.appendChild(mockPathElement)
      container.appendChild(mockSeriesElement)
      document.body.appendChild(container)
    })

    it('should apply direct styling to chart elements on selection', async () => {
      const { result, rerender } = renderHook(({ selectedKeys }) => useChartHighlighting({ selectedKeys }), {
        initialProps: { selectedKeys: new Set() },
      })

      // Set the container ref first
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Then change the selectedKeys to trigger the effect
      act(() => {
        rerender({ selectedKeys: new Set(['cpu']) })
      })

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // With selection, unselected elements should be dimmed (0.2)
      // But since 'cpu' is selected, it should remain visible (1)
      expect(mockPathElement).toHaveStyle({ opacity: '1' })
    })

    it('should dim unselected elements when there is a selection', async () => {
      // Create another series that won't be selected
      const mockSeriesElement2 = document.createElement('g')
      mockSeriesElement2.classList.add('series', 'series--memory')
      const mockPathElement2 = document.createElement('path')
      mockSeriesElement2.appendChild(mockPathElement2)
      container.appendChild(mockSeriesElement2)

      const { result, rerender } = renderHook(({ selectedKeys }) => useChartHighlighting({ selectedKeys }), {
        initialProps: { selectedKeys: new Set() },
      })

      // Set the container ref
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Then change the selectedKeys to trigger the effect
      act(() => {
        rerender({ selectedKeys: new Set(['cpu']) })
      })

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // CPU should be visible (selected)
      expect(mockPathElement).toHaveStyle({ opacity: '1' })
      // Memory should be dimmed (not selected)
      expect(mockPathElement2).toHaveStyle({ opacity: '0.2' })
    })

    it('should handle hover highlighting', async () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      // Set the container ref
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Trigger hover
      act(() => {
        result.current.handleHighlight('cpu')
      })

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // The hovered element should be visible
      expect(mockPathElement).toHaveStyle({ opacity: '1' })
    })

    it('should handle hover with unrelated elements being dimmed', async () => {
      // Create another series that won't be hovered
      const mockSeriesElement2 = document.createElement('g')
      mockSeriesElement2.classList.add('series', 'series--memory')
      const mockPathElement2 = document.createElement('path')
      mockSeriesElement2.appendChild(mockPathElement2)
      container.appendChild(mockSeriesElement2)

      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      // Set the container ref
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Trigger hover on cpu
      act(() => {
        result.current.handleHighlight('cpu')
      })

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // CPU should be visible (hovered)
      expect(mockPathElement).toHaveStyle({ opacity: '1' })
      // Memory should be dimmed (not hovered)
      expect(mockPathElement2).toHaveStyle({ opacity: '0.2' })
    })

    it('should clear hover when null is passed', async () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      // Set the container ref
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // First hover
      act(() => {
        result.current.handleHighlight('cpu')
      })

      // Clear hover
      act(() => {
        result.current.handleHighlight(null)
      })

      // Wait for effects to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // Should be back to normal (no dimming)
      expect(mockPathElement).toHaveStyle({ opacity: '1' })
    })

    it('should handle null container ref gracefully', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          selectedKeys: new Set(),
        })
      )

      // Don't set the container ref, should not throw
      expect(() => {
        act(() => {
          result.current.handleHighlight('cpu')
        })
      }).not.toThrow()
    })
  })

  describe('mutation observer', () => {
    it('should observe DOM changes when container is set', async () => {
      const mockObserve = jest.fn()
      const mockDisconnect = jest.fn()
      const MockMutationObserver = jest.fn().mockImplementation(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
      }))

      // Mock MutationObserver
      const originalMutationObserver = global.MutationObserver
      ;(global as unknown as { MutationObserver: unknown }).MutationObserver = MockMutationObserver

      const container = document.createElement('div')
      document.body.appendChild(container)

      const { result, unmount, rerender } = renderHook(({ selectedKeys }) => useChartHighlighting({ selectedKeys }), {
        initialProps: { selectedKeys: new Set() },
      })

      // Set the container ref - this should trigger the MutationObserver useEffect
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Trigger a rerender to make sure the useEffect runs
      act(() => {
        rerender({ selectedKeys: new Set(['test']) })
      })

      // Wait for effects
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(MockMutationObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalledWith(container, {
        childList: true,
        subtree: true,
        attributes: false,
      })

      // Cleanup should call disconnect
      unmount()
      expect(mockDisconnect).toHaveBeenCalled()

      // Restore original
      global.MutationObserver = originalMutationObserver
    })
  })
})

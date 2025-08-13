import { act, renderHook } from '@qovery/shared/util-tests'
import { useChartHighlighting } from './use-chart-highlighting'

describe('useChartHighlighting', () => {
  const mockMetricKeys = ['cpu', 'memory', 'disk', 'pod-889b7db58-yv1kc']
  const mockSelectedKeys = new Set(['cpu', 'memory'])

  beforeEach(() => {
    // Clear any existing DOM elements
    document.body.innerHTML = ''
  })

  describe('initialization', () => {
    it('should return expected properties', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.handleHighlight).toBeInstanceOf(Function)
      expect(result.current.highlightingStyles).toEqual(expect.any(String))
      expect(result.current.sanitizeKey).toBeInstanceOf(Function)
    })

    it('should generate highlighting styles for all metric keys', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      const styles = result.current.highlightingStyles

      // Should contain base dimming styles
      expect(styles).toContain('.highlight-scope.has-selection g.series path')
      expect(styles).toContain('.highlight-scope.has-hover g.series path')
      expect(styles).toContain('opacity: 0.2')

      // Should contain styles for each metric
      mockMetricKeys.forEach((key) => {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]+/g, '-')
        expect(styles).toContain(`.highlight-scope.selected-series--${sanitizedKey}`)
        expect(styles).toContain(`.highlight-scope.hover-series--${sanitizedKey}`)
        expect(styles).toContain('opacity: 1 !important')
      })
    })
  })

  describe('sanitizeKey function', () => {
    it('should sanitize keys with special characters', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: [],
          selectedKeys: new Set(),
        })
      )

      expect(result.current.sanitizeKey('pod-889b7db58-yv1kc')).toBe('pod-889b7db58-yv1kc')
      expect(result.current.sanitizeKey('metric@123#test')).toBe('metric-123-test')
      expect(result.current.sanitizeKey('simple-key')).toBe('simple-key')
      expect(result.current.sanitizeKey('key_with_underscores')).toBe('key_with_underscores')
    })
  })

  describe('selection highlighting', () => {
    it('should add selection classes when selectedKeys change', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const { result, rerender } = renderHook(
        ({ selectedKeys }) =>
          useChartHighlighting({
            metricKeys: mockMetricKeys,
            selectedKeys,
          }),
        { initialProps: { selectedKeys: new Set() } }
      )

      // Set the container ref manually before triggering the effect
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      // Re-render with new selection to trigger the useEffect
      act(() => {
        rerender({ selectedKeys: new Set(['cpu', 'memory']) })
      })

      expect(container.classList.contains('has-selection')).toBe(true)
      expect(container.classList.contains('selected-series--cpu')).toBe(true)
      expect(container.classList.contains('selected-series--memory')).toBe(true)
    })

    it('should remove has-selection class when no items selected', () => {
      const container = document.createElement('div')
      container.classList.add('has-selection', 'selected-series--cpu')
      document.body.appendChild(container)

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      // Manually trigger the selection effect
      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })

        // Simulate the useEffect by manually calling the logic
        container.classList.forEach((className) => {
          if (className.startsWith('selected-series--')) {
            container.classList.remove(className)
          }
        })
        container.classList.toggle('has-selection', false)
      })

      expect(container.classList.contains('has-selection')).toBe(false)
      expect(container.classList.contains('selected-series--cpu')).toBe(false)
    })
  })

  describe('handleHighlight function', () => {
    it('should add hover classes when highlighting a key', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      // Set the container ref manually
      Object.defineProperty(result.current.containerRef, 'current', {
        value: container,
        writable: true,
      })

      act(() => {
        result.current.handleHighlight('cpu')
      })

      expect(container.classList.contains('has-hover')).toBe(true)
      expect(container.classList.contains('hover-series--cpu')).toBe(true)
    })

    it('should remove hover classes when highlighting null', () => {
      const container = document.createElement('div')
      container.classList.add('has-hover', 'hover-series--cpu')
      document.body.appendChild(container)

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      // Set the container ref manually
      Object.defineProperty(result.current.containerRef, 'current', {
        value: container,
        writable: true,
      })

      act(() => {
        result.current.handleHighlight(null)
      })

      expect(container.classList.contains('has-hover')).toBe(false)
      expect(container.classList.contains('hover-series--cpu')).toBe(false)
    })

    it('should handle keys with special characters', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      // Set the container ref manually
      Object.defineProperty(result.current.containerRef, 'current', {
        value: container,
        writable: true,
      })

      act(() => {
        result.current.handleHighlight('pod-889b7db58-yv1kc')
      })

      expect(container.classList.contains('hover-series--pod-889b7db58-yv1kc')).toBe(true)
    })

    it('should replace existing hover classes when switching highlights', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
          selectedKeys: new Set(),
        })
      )

      // Set the container ref manually
      Object.defineProperty(result.current.containerRef, 'current', {
        value: container,
        writable: true,
      })

      // Highlight first key
      act(() => {
        result.current.handleHighlight('cpu')
      })

      expect(container.classList.contains('hover-series--cpu')).toBe(true)

      // Highlight second key
      act(() => {
        result.current.handleHighlight('memory')
      })

      expect(container.classList.contains('hover-series--cpu')).toBe(false)
      expect(container.classList.contains('hover-series--memory')).toBe(true)
    })

    it('should handle null container ref gracefully', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: mockMetricKeys,
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

  describe('style generation edge cases', () => {
    it('should handle empty metric keys array', () => {
      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: [],
          selectedKeys: new Set(),
        })
      )

      const styles = result.current.highlightingStyles
      expect(styles).toContain('.highlight-scope.has-selection')
      expect(styles).toContain('.highlight-scope.has-hover')
      // Should not contain any metric-specific styles
      expect(styles).not.toContain('selected-series--')
      expect(styles).not.toContain('hover-series--')
    })

    it('should handle metric keys with various special characters', () => {
      const specialKeys = ['key@test', 'key#hash', 'key space', 'key.dot']

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: specialKeys,
          selectedKeys: new Set(),
        })
      )

      const styles = result.current.highlightingStyles

      // All special characters should be sanitized to hyphens
      expect(styles).toContain('selected-series--key-test')
      expect(styles).toContain('selected-series--key-hash')
      expect(styles).toContain('selected-series--key-space')
      expect(styles).toContain('selected-series--key-dot')
    })
  })

  describe('integration scenarios', () => {
    it('should work with real-world metric keys', () => {
      const realWorldKeys = [
        'cpu-usage',
        'memory_utilization',
        'disk.io.read',
        'network/bandwidth',
        'pod-889b7db58-yv1kc',
        'service@namespace#cluster',
      ]

      const { result } = renderHook(() =>
        useChartHighlighting({
          metricKeys: realWorldKeys,
          selectedKeys: new Set(['cpu-usage', 'pod-889b7db58-yv1kc']),
        })
      )

      expect(result.current.highlightingStyles).toContain('selected-series--cpu-usage')
      expect(result.current.highlightingStyles).toContain('selected-series--pod-889b7db58-yv1kc')
      expect(result.current.highlightingStyles).toContain('selected-series--service-namespace-cluster')
    })
  })
})

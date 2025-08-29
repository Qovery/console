import { act, renderHook } from '@qovery/shared/util-tests'
import { useChartHighlighting } from './use-chart-highlighting'

describe('useChartHighlighting', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

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

  it('should handle null container ref gracefully', () => {
    const { result } = renderHook(() =>
      useChartHighlighting({
        selectedKeys: new Set(),
      })
    )

    expect(() => {
      act(() => {
        result.current.handleHighlight('cpu')
      })
    }).not.toThrow()
  })

  it('should apply direct styling to chart elements', () => {
    const container = document.createElement('div')
    const seriesElement = document.createElement('g')
    const pathElement = document.createElement('path')

    seriesElement.className = 'series series--cpu'
    seriesElement.appendChild(pathElement)
    container.appendChild(seriesElement)
    document.body.appendChild(container)

    const initialSelectedKeys = new Set<string>()
    const { result, rerender } = renderHook(
      ({ selectedKeys }: { selectedKeys: Set<string> }) => useChartHighlighting({ selectedKeys }),
      { initialProps: { selectedKeys: initialSelectedKeys } }
    )

    act(() => {
      Object.defineProperty(result.current.containerRef, 'current', {
        value: container,
        writable: true,
      })
    })

    // Rerender with selected keys to trigger the effect
    act(() => {
      rerender({ selectedKeys: new Set(['cpu']) })
    })

    // The path element should have full opacity when selected
    expect(pathElement).toHaveStyle('opacity: 1')
  })
})

import { act, renderHook } from '@testing-library/react'
import { useChartHighlightingSync } from './use-chart-highlighting-sync'

describe('useChartHighlightingSync', () => {
  it('should return provided selectedKeys', () => {
    const selectedKeys = new Set(['key1', 'key2'])
    const { result } = renderHook(() => useChartHighlightingSync({ selectedKeys }))

    expect(result.current.selectedKeys).toBe(selectedKeys)
  })

  it('should return default empty Set when no selectedKeys provided', () => {
    const { result } = renderHook(() => useChartHighlightingSync({}))

    expect(result.current.selectedKeys).toEqual(new Set())
  })

  it('should call onSelectionChange when toggling selection', () => {
    const onSelectionChange = jest.fn()
    const selectedKeys = new Set(['key1'])

    const { result } = renderHook(() => useChartHighlightingSync({ selectedKeys, onSelectionChange }))

    act(() => {
      result.current.onSelectionToggle('key2')
    })

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['key1', 'key2']))
  })

  it('should remove key when toggling already selected key', () => {
    const onSelectionChange = jest.fn()
    const selectedKeys = new Set(['key1', 'key2'])

    const { result } = renderHook(() => useChartHighlightingSync({ selectedKeys, onSelectionChange }))

    act(() => {
      result.current.onSelectionToggle('key1')
    })

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['key2']))
  })

  it('should call onHighlightChange when highlighting', () => {
    const onHighlightChange = jest.fn()

    const { result } = renderHook(() => useChartHighlightingSync({ onHighlightChange }))

    act(() => {
      result.current.onHighlight('key1')
    })

    expect(onHighlightChange).toHaveBeenCalledWith('key1')
  })

  it('should handle null highlight', () => {
    const onHighlightChange = jest.fn()

    const { result } = renderHook(() => useChartHighlightingSync({ onHighlightChange }))

    act(() => {
      result.current.onHighlight(null)
    })

    expect(onHighlightChange).toHaveBeenCalledWith(null)
  })

  it('should not call callbacks when they are not provided', () => {
    const { result } = renderHook(() => useChartHighlightingSync({}))

    // These should not throw
    act(() => {
      result.current.onSelectionToggle('key1')
      result.current.onHighlight('key1')
    })

    expect(result.current.selectedKeys).toEqual(new Set())
    expect(result.current.highlightedKey).toBeNull()
  })

  it('should return provided highlightedKey', () => {
    const highlightedKey = 'key1'
    const { result } = renderHook(() => useChartHighlightingSync({ highlightedKey }))

    expect(result.current.highlightedKey).toBe(highlightedKey)
  })
})

import { act, renderHook } from '@qovery/shared/util-tests'
import { useChartHighlighting } from './use-chart-highlighting'

global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))

describe('useChartHighlighting', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('should return expected properties', () => {
    const { result } = renderHook(() => useChartHighlighting({ selectedKeys: new Set() }))

    expect(result.current.containerRef).toBeDefined()
    expect(result.current.handleHighlight).toBeInstanceOf(Function)
    expect(result.current.sanitizeKey).toBeInstanceOf(Function)
  })

  it('should sanitize keys with special characters', () => {
    const { result } = renderHook(() => useChartHighlighting({ selectedKeys: new Set() }))

    expect(result.current.sanitizeKey('metric@123#test')).toBe('metric-123-test')
    expect(result.current.sanitizeKey('simple-key')).toBe('simple-key')
  })

  describe('highlighting functionality', () => {
    let container: HTMLDivElement
    let cpuPath: HTMLElement
    let memoryPath: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')

      const cpuSeries = document.createElement('g')
      cpuSeries.classList.add('series', 'series--cpu')
      cpuPath = document.createElement('path')
      cpuSeries.appendChild(cpuPath)

      const memorySeries = document.createElement('g')
      memorySeries.classList.add('series', 'series--memory')
      memoryPath = document.createElement('path')
      memorySeries.appendChild(memoryPath)

      container.appendChild(cpuSeries)
      container.appendChild(memorySeries)
      document.body.appendChild(container)
    })

    it('should highlight selected elements and dim unselected ones', async () => {
      const { result, rerender } = renderHook(({ selectedKeys }) => useChartHighlighting({ selectedKeys }), {
        initialProps: { selectedKeys: new Set<string>() },
      })

      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      act(() => {
        rerender({ selectedKeys: new Set(['cpu']) })
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(cpuPath).toHaveStyle({ opacity: '1' })
      expect(memoryPath).toHaveStyle({ opacity: '0.2' })
    })

    it('should handle hover highlighting', async () => {
      const { result } = renderHook(() => useChartHighlighting({ selectedKeys: new Set() }))

      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      act(() => {
        result.current.handleHighlight('cpu')
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(cpuPath).toHaveStyle({ opacity: '1' })
      expect(memoryPath).toHaveStyle({ opacity: '0.2' })
    })

    it('should clear highlighting when hover is null', async () => {
      const { result } = renderHook(() => useChartHighlighting({ selectedKeys: new Set() }))

      act(() => {
        Object.defineProperty(result.current.containerRef, 'current', {
          value: container,
          writable: true,
        })
      })

      act(() => {
        result.current.handleHighlight('cpu')
      })

      act(() => {
        result.current.handleHighlight(null)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(cpuPath).toHaveStyle({ opacity: '1' })
      expect(memoryPath).toHaveStyle({ opacity: '1' })
    })
  })
})

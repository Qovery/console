import { act, renderHook } from '@testing-library/react'
import { useZoomableChart } from './use-zoomable-chart'

describe('useZoomableChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('initializes with default zoom state', () => {
      const { result } = renderHook(() => useZoomableChart())

      expect(result.current.zoomState).toEqual({
        left: 'dataMin',
        right: 'dataMax',
        refAreaLeft: '',
        refAreaRight: '',
      })
      expect(result.current.zoomHistory).toEqual([])
      expect(result.current.isCtrlPressed).toBe(false)
      expect(result.current.isZoomed).toBe(false)
    })
  })

  describe('keyboard event handling', () => {
    it('sets isCtrlPressed to true when Control key is pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(event)
      })

      expect(result.current.isCtrlPressed).toBe(true)
    })

    it('sets isCtrlPressed to true when Meta key is pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Meta' })
        window.dispatchEvent(event)
      })

      expect(result.current.isCtrlPressed).toBe(true)
    })

    it('sets isCtrlPressed to false when Control key is released', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(keyDownEvent)
      })

      expect(result.current.isCtrlPressed).toBe(true)

      act(() => {
        const keyUpEvent = new KeyboardEvent('keyup', { key: 'Control' })
        window.dispatchEvent(keyUpEvent)
      })

      expect(result.current.isCtrlPressed).toBe(false)
    })

    it('sets isCtrlPressed to false when Meta key is released', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Meta' })
        window.dispatchEvent(keyDownEvent)
      })

      expect(result.current.isCtrlPressed).toBe(true)

      act(() => {
        const keyUpEvent = new KeyboardEvent('keyup', { key: 'Meta' })
        window.dispatchEvent(keyUpEvent)
      })

      expect(result.current.isCtrlPressed).toBe(false)
    })

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useZoomableChart())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('zoom functionality', () => {
    it('does not zoom when refAreaLeft equals refAreaRight', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
      expect(result.current.zoomHistory).toHaveLength(0)
    })

    it('does not zoom when refAreaRight is empty', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
      expect(result.current.zoomHistory).toHaveLength(0)
    })

    it('zooms in when valid refArea is set', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('200')
      expect(result.current.zoomHistory).toHaveLength(1)
      expect(result.current.zoomHistory[0]).toEqual({ left: 'dataMin', right: 'dataMax' })
      expect(result.current.isZoomed).toBe(true)
    })

    it('swaps refArea values when left is greater than right', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '100' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('200')
    })

    it('clears refArea after zooming', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomState.refAreaLeft).toBe('')
      expect(result.current.zoomState.refAreaRight).toBe('')
    })
  })

  describe('zoom out functionality', () => {
    it('does nothing when zoom history is empty', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
      expect(result.current.zoomHistory).toHaveLength(0)
    })

    it('restores previous zoom level when history exists', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomHistory).toHaveLength(1)

      // Zoom out
      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.isZoomed).toBe(false)
    })

    it('works with multiple zoom levels', () => {
      const { result } = renderHook(() => useZoomableChart())

      // First zoom
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '300' })
      })

      act(() => {
        result.current.zoom()
      })

      // Second zoom
      act(() => {
        result.current.handleMouseDown({ activeLabel: '150' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '250' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomHistory).toHaveLength(2)
      expect(result.current.zoomState.left).toBe('150')
      expect(result.current.zoomState.right).toBe('250')

      // Zoom out once
      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoomHistory).toHaveLength(1)
      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('300')

      // Zoom out again
      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
    })
  })

  describe('reset zoom functionality', () => {
    it('resets zoom state to default', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.isZoomed).toBe(true)
      expect(result.current.zoomHistory).toHaveLength(1)

      // Reset zoom
      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.zoomState).toEqual({
        left: 'dataMin',
        right: 'dataMax',
        refAreaLeft: '',
        refAreaRight: '',
      })
      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.isZoomed).toBe(false)
    })
  })

  describe('mouse event handlers', () => {
    it('sets refAreaLeft on mouse down when ctrl is not pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      expect(result.current.zoomState.refAreaLeft).toBe('100')
    })

    it('does not set refAreaLeft on mouse down when ctrl is pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Press ctrl
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(event)
      })

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      expect(result.current.zoomState.refAreaLeft).toBe('')
    })

    it('sets refAreaRight on mouse move when ctrl is not pressed and refAreaLeft exists', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      expect(result.current.zoomState.refAreaRight).toBe('200')
    })

    it('does not set refAreaRight on mouse move when ctrl is pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Press ctrl
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(event)
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      expect(result.current.zoomState.refAreaRight).toBe('')
    })

    it('does not set refAreaRight on mouse move when refAreaLeft is empty', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      expect(result.current.zoomState.refAreaRight).toBe('')
    })

    it('calls zoom on mouse up when ctrl is not pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('200')
    })

    it('calls handleChartClick on mouse up when ctrl is pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first to have history
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomHistory).toHaveLength(1)

      // Press ctrl
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(event)
      })

      // Mouse up should trigger zoom out via handleChartClick
      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
    })
  })

  describe('chart click handlers', () => {
    it('zooms out when ctrl is pressed and chart is clicked', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomHistory).toHaveLength(1)

      // Press ctrl
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Control' })
        window.dispatchEvent(event)
      })

      act(() => {
        result.current.handleChartClick()
      })

      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.zoomState.right).toBe('dataMax')
    })

    it('does nothing on chart click when ctrl is not pressed', () => {
      const { result } = renderHook(() => useZoomableChart())

      const initialState = { ...result.current.zoomState }

      act(() => {
        result.current.handleChartClick()
      })

      expect(result.current.zoomState).toEqual(initialState)
    })

    it('resets zoom completely on double click', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Create multiple zoom levels
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '300' })
      })

      act(() => {
        result.current.zoom()
      })

      act(() => {
        result.current.handleMouseDown({ activeLabel: '150' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '250' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.zoomHistory).toHaveLength(2)

      // Double click should reset completely
      act(() => {
        result.current.handleChartDoubleClick()
      })

      expect(result.current.zoomState).toEqual({
        left: 'dataMin',
        right: 'dataMax',
        refAreaLeft: '',
        refAreaRight: '',
      })
      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.isZoomed).toBe(false)
    })
  })

  describe('getXDomain utility', () => {
    it('returns default domain when not zoomed', () => {
      const { result } = renderHook(() => useZoomableChart())

      expect(result.current.getXDomain()).toEqual(['dataMin', 'dataMax'])
      expect(result.current.getXDomain([0, 100])).toEqual([0, 100])
    })

    it('returns zoom domain when zoomed', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.getXDomain()).toEqual(['100', '200'])
      expect(result.current.getXDomain([0, 1000])).toEqual(['100', '200'])
    })
  })

  describe('isZoomed property', () => {
    it('returns false when at default zoom', () => {
      const { result } = renderHook(() => useZoomableChart())

      expect(result.current.isZoomed).toBe(false)
    })

    it('returns true when zoomed in', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.isZoomed).toBe(true)
    })

    it('returns false after reset', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.zoom()
      })

      expect(result.current.isZoomed).toBe(true)

      // Reset
      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.isZoomed).toBe(false)
    })
  })
})

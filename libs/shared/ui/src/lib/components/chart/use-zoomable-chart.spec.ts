import { createElement } from 'react'
import { act, renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { useZoomableChart } from './use-zoomable-chart'

describe('useZoomableChart', () => {
  let user: ReturnType<typeof renderWithProviders>['userEvent']

  beforeEach(() => {
    jest.clearAllMocks()
    // Get userEvent from renderWithProviders by rendering a dummy component
    const { userEvent: userEventInstance } = renderWithProviders(createElement('div'))
    user = userEventInstance
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
    it('handles Control and Meta key press/release', async () => {
      const { result } = renderHook(() => useZoomableChart())

      // Test Control key
      await user.keyboard('{Control>}')
      expect(result.current.isCtrlPressed).toBe(true)

      await user.keyboard('{/Control}')
      expect(result.current.isCtrlPressed).toBe(false)

      // Test Meta key
      await user.keyboard('{Meta>}')
      expect(result.current.isCtrlPressed).toBe(true)
    })
  })

  describe('zoom functionality', () => {
    it('zooms in with valid selection and handles edge cases', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Test zoom in using handleMouseUp which calls zoom internally
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
      expect(result.current.zoomHistory).toHaveLength(1)
      expect(result.current.isZoomed).toBe(true)
      expect(result.current.zoomState.refAreaLeft).toBe('')
      expect(result.current.zoomState.refAreaRight).toBe('')
    })

    it('swaps values when left is greater than right', () => {
      const { result } = renderHook(() => useZoomableChart())

      act(() => {
        result.current.handleMouseDown({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('200')
    })
  })

  describe('zoom out functionality', () => {
    it('restores previous zoom level', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first using handleMouseUp which calls zoom internally
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
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
  })

  describe('reset zoom functionality', () => {
    it('resets zoom state to default', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first using handleMouseUp which calls zoom internally
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isZoomed).toBe(true)

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
    it('handles mouse interactions for zoom selection', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Test normal mouse interaction
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })
      expect(result.current.zoomState.refAreaLeft).toBe('100')

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })
      expect(result.current.zoomState.refAreaRight).toBe('200')

      act(() => {
        result.current.handleMouseUp()
      })
      expect(result.current.zoomState.left).toBe('100')
      expect(result.current.zoomState.right).toBe('200')
      expect(result.current.isZoomed).toBe(true)
    })

    it('respects ctrl key state during mouse interactions', async () => {
      const { result } = renderHook(() => useZoomableChart())

      // Press ctrl
      await user.keyboard('{Control>}')

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })
      expect(result.current.zoomState.refAreaLeft).toBe('')
    })
  })

  describe('chart click handlers', () => {
    it('handles ctrl+click for zoom out', async () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.zoomHistory).toHaveLength(1)

      // Test ctrl+click zoom out
      await user.keyboard('{Control>}')

      act(() => {
        result.current.handleChartClick()
      })

      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.zoomState.left).toBe('dataMin')
      expect(result.current.isZoomed).toBe(false)
    })

    it('handles double-click for complete reset', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isZoomed).toBe(true)

      act(() => {
        result.current.handleChartDoubleClick()
      })

      expect(result.current.zoomHistory).toHaveLength(0)
      expect(result.current.isZoomed).toBe(false)
    })

    it('handles double-click with custom onDoubleClick handler', () => {
      const mockOnDoubleClick = jest.fn()
      const { result } = renderHook(() => useZoomableChart({ onDoubleClick: mockOnDoubleClick }))

      // Zoom in first
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isZoomed).toBe(true)

      act(() => {
        result.current.handleChartDoubleClick()
      })

      // Custom handler should be called instead of default reset
      expect(mockOnDoubleClick).toHaveBeenCalledTimes(1)
      // Zoom state should remain unchanged since custom handler was called
      expect(result.current.isZoomed).toBe(true)
      expect(result.current.zoomHistory).toHaveLength(1)
    })

    it('does not reset zoom when double-clicking if not zoomed', () => {
      const onZoomChange = jest.fn()
      const { result } = renderHook(() => useZoomableChart({ onZoomChange }))

      // Initially not zoomed
      expect(result.current.isZoomed).toBe(false)

      // Double-click when not zoomed
      act(() => {
        result.current.handleChartDoubleClick()
      })

      // Should remain not zoomed and not call onZoomChange
      expect(result.current.isZoomed).toBe(false)
      expect(result.current.zoomState).toEqual({
        left: 'dataMin',
        right: 'dataMax',
        refAreaLeft: '',
        refAreaRight: '',
      })
      expect(onZoomChange).not.toHaveBeenCalled()
    })
  })

  describe('utilities', () => {
    it('getXDomain returns correct domain based on zoom state', () => {
      const { result } = renderHook(() => useZoomableChart())

      // Test default domain
      expect(result.current.getXDomain()).toEqual(['dataMin', 'dataMax'])
      expect(result.current.getXDomain([0, 100])).toEqual([0, 100])

      // Test zoomed domain using handleMouseUp which calls zoom internally
      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.getXDomain()).toEqual(['100', '200'])
      expect(result.current.getXDomain([0, 1000])).toEqual(['100', '200'])
    })

    it('isZoomed reflects zoom state correctly', () => {
      const { result } = renderHook(() => useZoomableChart())

      expect(result.current.isZoomed).toBe(false)

      act(() => {
        result.current.handleMouseDown({ activeLabel: '100' })
      })

      act(() => {
        result.current.handleMouseMove({ activeLabel: '200' })
      })

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isZoomed).toBe(true)

      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.isZoomed).toBe(false)
    })
  })
})

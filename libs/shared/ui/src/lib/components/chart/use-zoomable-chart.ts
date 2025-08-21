import { useEffect, useState } from 'react'

interface ChartMouseEvent {
  activeLabel?: string
}

interface ZoomState {
  left: string | number
  right: string | number
  refAreaLeft: string | number
  refAreaRight: string | number
}

interface ZoomLevel {
  left: string | number
  right: string | number
}

interface UseZoomableChartProps {
  onZoomChange?: (startTime: number, endTime: number) => void
  onResetRegister?: (resetFn: () => void) => (() => void) | void
  onZoomStateChange?: (isZoomed: boolean) => void
  onDoubleClick?: () => void
  disabled?: boolean
}

interface UseZoomableChartReturn {
  // State
  zoomState: ZoomState
  zoomHistory: ZoomLevel[]
  isCtrlPressed: boolean

  // Actions
  zoom: () => void
  zoomOut: () => void
  resetZoom: () => void

  // Event handlers
  handleChartClick: () => void
  handleChartDoubleClick: () => void
  handleMouseDown: (e?: ChartMouseEvent) => void
  handleMouseMove: (e?: ChartMouseEvent) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void

  // Utilities
  getXDomain: (defaultDomain?: [number | string, number | string]) => [number | string, number | string]
  getXAxisTicks: (defaultDomain?: [number | string, number | string], tickCount?: number) => number[]
  isZoomed: boolean
}

export function useZoomableChart(props: UseZoomableChartProps = {}): UseZoomableChartReturn {
  const { onZoomChange, onResetRegister, onZoomStateChange, onDoubleClick, disabled = false } = props
  // Zoom state
  const [zoomState, setZoomState] = useState<ZoomState>({
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
  })

  const [zoomHistory, setZoomHistory] = useState<ZoomLevel[]>([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  const isZoomed = zoomState.left !== 'dataMin' || zoomState.right !== 'dataMax'

  // Notify when zoom state changes
  useEffect(() => {
    if (onZoomStateChange) {
      onZoomStateChange(isZoomed)
    }
  }, [isZoomed, onZoomStateChange])

  // Register reset function with parent component (if provided)
  useEffect(() => {
    if (onResetRegister) {
      const cleanup = onResetRegister(() => {
        setZoomHistory([])
        setZoomState((prevState) => ({
          ...prevState,
          refAreaLeft: '',
          refAreaRight: '',
          left: 'dataMin',
          right: 'dataMax',
        }))
      })
      return cleanup || undefined
    }
    return undefined
  }, [onResetRegister])

  // Keyboard event handlers for zoom
  useEffect(() => {
    if (disabled) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [disabled])

  // Zoom functions
  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomState

    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setZoomState((prevState) => ({
        ...prevState,
        refAreaLeft: '',
        refAreaRight: '',
      }))
      return
    }

    // xAxis domain - only zoom on X axis
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft]

    // Save current zoom level to history before zooming in
    setZoomHistory((prevHistory) => [...prevHistory, { left: zoomState.left, right: zoomState.right }])

    setZoomState((prevState) => ({
      ...prevState,
      refAreaLeft: '',
      refAreaRight: '',
      left: refAreaLeft,
      right: refAreaRight,
    }))

    // Fire the callback when zoom changes
    if (onZoomChange && typeof refAreaLeft === 'number' && typeof refAreaRight === 'number') {
      onZoomChange(Math.floor(refAreaLeft / 1000), Math.floor(refAreaRight / 1000))
    }
  }

  const zoomOut = () => {
    if (zoomHistory.length > 0) {
      // Go back one zoom level
      const previousZoom = zoomHistory[zoomHistory.length - 1]
      setZoomHistory((prevHistory) => prevHistory.slice(0, -1))
      setZoomState((prevState) => ({
        ...prevState,
        refAreaLeft: '',
        refAreaRight: '',
        left: previousZoom.left,
        right: previousZoom.right,
      }))

      // Fire the callback when zoom out
      if (onZoomChange && typeof previousZoom.left === 'number' && typeof previousZoom.right === 'number') {
        onZoomChange(Math.floor(previousZoom.left / 1000), Math.floor(previousZoom.right / 1000))
      }
    }
  }

  const resetZoom = () => {
    setZoomHistory([])
    setZoomState((prevState) => ({
      ...prevState,
      refAreaLeft: '',
      refAreaRight: '',
      left: 'dataMin',
      right: 'dataMax',
    }))

    // Fire the callback when zoom is reset
    if (onZoomChange) {
      const now = Date.now()
      const thirtyMinutesAgo = now - 30 * 60 * 1000
      onZoomChange(Math.floor(thirtyMinutesAgo / 1000), Math.floor(now / 1000))
    }
  }

  // Event handlers
  const handleChartClick = () => {
    if (disabled) {
      return
    }
    if (isCtrlPressed) {
      // Single click with ctrl/cmd: zoom out one step
      zoomOut()
    }
  }

  const handleChartDoubleClick = () => {
    if (disabled) {
      return
    }

    if (isZoomed) {
        // Call custom handler if provided, otherwise reset zoom internally
        if (onDoubleClick) {
            onDoubleClick()
        } else {
            resetZoom()
        }
    }
  }

  const handleMouseDown = (e?: ChartMouseEvent) => {
    if (disabled) {
      return
    }
    if (!isCtrlPressed && e) {
      setZoomState((prevState) => ({ ...prevState, refAreaLeft: e.activeLabel || '' }))
    }
  }

  const handleMouseMove = (e?: ChartMouseEvent) => {
    if (disabled) {
      return
    }
    if (!isCtrlPressed && zoomState.refAreaLeft && e) {
      setZoomState((prevState) => ({ ...prevState, refAreaRight: e.activeLabel || '' }))
    }
  }

  const handleMouseUp = () => {
    if (disabled) {
      return
    }
    if (isCtrlPressed) {
      handleChartClick()
    } else {
      zoom()
    }
  }

  const handleMouseLeave = () => {
    // Reset any dragging state if needed
  }

  // Utilities
  const getXDomain = (
    defaultDomain: [number | string, number | string] = ['dataMin', 'dataMax']
  ): [number | string, number | string] => {
    // Use zoom domain if zoomed, otherwise use provided or default domain
    if (zoomState.left !== 'dataMin' || zoomState.right !== 'dataMax') {
      return [zoomState.left, zoomState.right]
    }
    return defaultDomain
  }

  const getXAxisTicks = (
    defaultDomain: [number | string, number | string] = ['dataMin', 'dataMax'],
    tickCount = 6
  ): number[] => {
    // Get the current domain (zoomed or default)
    const currentDomain = getXDomain(defaultDomain)

    // If we have specific numeric values (zoomed state), calculate ticks for that range
    if (typeof currentDomain[0] === 'number' && typeof currentDomain[1] === 'number') {
      const startTime = currentDomain[0]
      const endTime = currentDomain[1]
      const ticks: number[] = []
      const interval = (endTime - startTime) / (tickCount - 1)

      for (let i = 0; i < tickCount; i++) {
        ticks.push(startTime + interval * i)
      }
      return ticks
    }

    // For default domain or string values, return empty array (let Recharts handle it)
    return []
  }

  return {
    // State
    zoomState,
    zoomHistory,
    isCtrlPressed,

    // Actions
    zoom,
    zoomOut,
    resetZoom,

    // Event handlers
    handleChartClick,
    handleChartDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,

    // Utilities
    getXDomain,
    getXAxisTicks,
    isZoomed,
  }
}

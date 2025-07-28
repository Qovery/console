import { useEffect, useState } from 'react'

interface ZoomState {
  left: string | number
  right: string | number
  refAreaLeft: string
  refAreaRight: string
}

interface ZoomLevel {
  left: string | number
  right: string | number
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
  handleMouseDown: (e: any) => void
  handleMouseMove: (e: any) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void

  // Utilities
  getXDomain: (defaultDomain?: [number | string, number | string]) => [number | string, number | string]
  isZoomed: boolean
}

export function useZoomableChart(): UseZoomableChartReturn {
  // Zoom state
  const [zoomState, setZoomState] = useState<ZoomState>({
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
  })

  const [zoomHistory, setZoomHistory] = useState<ZoomLevel[]>([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  // Keyboard event handlers for zoom
  useEffect(() => {
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
  }, [])

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
  }

  // Event handlers
  const handleChartClick = () => {
    if (isCtrlPressed) {
      // Single click with ctrl/cmd: zoom out one step
      zoomOut()
    }
  }

  const handleChartDoubleClick = () => {
    // Double click: reset zoom completely
    resetZoom()
  }

  const handleMouseDown = (e: any) => {
    if (!isCtrlPressed && e) {
      setZoomState((prevState) => ({ ...prevState, refAreaLeft: e.activeLabel || '' }))
    }
    setOnHoverHideTooltip(true)
  }

  const handleMouseMove = (e: any) => {
    if (!isCtrlPressed && zoomState.refAreaLeft && e) {
      setZoomState((prevState) => ({ ...prevState, refAreaRight: e.activeLabel || '' }))
    }
    setOnHoverHideTooltip(true)
  }

  const handleMouseUp = () => {
    if (isCtrlPressed) {
      handleChartClick()
    } else {
      zoom()
    }
    setOnHoverHideTooltip(false)
  }

  const handleMouseLeave = () => {
    setOnHoverHideTooltip(false)
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

  const isZoomed = zoomState.left !== 'dataMin' || zoomState.right !== 'dataMax'

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
    isZoomed,
  }
}

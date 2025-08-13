import { act, render, renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceOverviewProvider, useServiceOverviewContext } from './service-overview-context'

describe('ServiceOverviewContext', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useServiceOverviewContext()
      return <div>Test</div>
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useServiceOverviewContext must be used within an ServiceOverviewProvider'
    )
  })

  it('should return context value when used inside provider', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    expect(result.current).toBeDefined()
    expect(result.current.useLocalTime).toBe(false)
    expect(result.current.timeRange).toBe('30m')
    expect(result.current.hideEvents).toBe(false)
    expect(result.current.expandCharts).toBe(false)
    expect(result.current.hasCalendarValue).toBe(false)
    expect(result.current.hoveredEventKey).toBe(null)
  })

  it('should allow updating useLocalTime', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setUseLocalTime(true)
    })

    expect(result.current.useLocalTime).toBe(true)
  })

  it('should allow updating timeRange', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setTimeRange('1h')
    })

    expect(result.current.timeRange).toBe('1h')
  })

  it('should allow updating hideEvents', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setHideEvents(true)
    })

    expect(result.current.hideEvents).toBe(true)
  })

  it('should allow updating expandCharts', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setExpandCharts(true)
    })

    expect(result.current.expandCharts).toBe(true)
  })

  it('should allow updating hasCalendarValue', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setHasCalendarValue(true)
    })

    expect(result.current.hasCalendarValue).toBe(true)
  })

  it('should allow updating hoveredEventKey', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.setHoveredEventKey('test-key')
    })

    expect(result.current.hoveredEventKey).toBe('test-key')
  })

  it('should handle timeRange changes with handleTimeRangeChange', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.handleTimeRangeChange('6h')
    })

    expect(result.current.timeRange).toBe('6h')
  })

  it('should update timestamps when dates change', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    const initialStartTimestamp = result.current.startTimestamp
    const initialEndTimestamp = result.current.endTimestamp

    act(() => {
      result.current.setStartDate('2024-01-01T10:00:00.000Z')
      result.current.setEndDate('2024-01-01T11:00:00.000Z')
    })

    expect(result.current.startTimestamp).not.toBe(initialStartTimestamp)
    expect(result.current.endTimestamp).not.toBe(initialEndTimestamp)
    expect(result.current.startDate).toBe('2024-01-01T10:00:00.000Z')
    expect(result.current.endDate).toBe('2024-01-01T11:00:00.000Z')
  })
})

describe('ServiceOverviewContext zoom integration', () => {
  it('should call resetChartZoom when handleTimeRangeChange is called', () => {
    const mockResetFn = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.registerZoomReset(mockResetFn)
    })

    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    expect(mockResetFn).toHaveBeenCalledTimes(1)
    expect(result.current.timeRange).toBe('1h')
  })

  it('should reset isAnyChartZoomed when resetChartZoom is called', () => {
    const mockResetFn = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.registerZoomReset(mockResetFn)
      result.current.setIsAnyChartZoomed(true)
    })

    expect(result.current.isAnyChartZoomed).toBe(true)

    act(() => {
      result.current.resetChartZoom()
    })

    expect(mockResetFn).toHaveBeenCalledTimes(1)
    expect(result.current.isAnyChartZoomed).toBe(false)
  })

  it('should call all registered zoom reset functions', () => {
    const mockResetFn1 = jest.fn()
    const mockResetFn2 = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.registerZoomReset(mockResetFn1)
      result.current.registerZoomReset(mockResetFn2)
    })

    act(() => {
      result.current.resetChartZoom()
    })

    expect(mockResetFn1).toHaveBeenCalledTimes(1)
    expect(mockResetFn2).toHaveBeenCalledTimes(1)
  })

  it('should call registered zoom reset functions', () => {
    const mockResetFn = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.registerZoomReset(mockResetFn)
    })

    act(() => {
      result.current.resetChartZoom()
    })

    expect(mockResetFn).toHaveBeenCalledTimes(1)
  })

  it('should reset zoom before updating time range in handleTimeRangeChange', () => {
    const mockResetFn = jest.fn()
    const callOrder: string[] = []

    mockResetFn.mockImplementation(() => callOrder.push('resetZoom'))

    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    act(() => {
      result.current.registerZoomReset(mockResetFn)
    })

    // Track when time range actually changes by watching the result
    const originalTimeRange = result.current.timeRange

    act(() => {
      result.current.handleTimeRangeChange('3h')
      // Time range change happens synchronously after reset
      if (result.current.timeRange !== originalTimeRange) {
        callOrder.push('timeRangeChanged')
      }
    })

    expect(callOrder[0]).toBe('resetZoom')
    expect(result.current.timeRange).toBe('3h')
  })

  it('should handle zoom time range changes via handleZoomTimeRangeChange', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    const startTimestamp = 1640995200 // 2022-01-01 00:00:00 UTC
    const endTimestamp = 1641081600 // 2022-01-02 00:00:00 UTC

    act(() => {
      result.current.handleZoomTimeRangeChange(startTimestamp, endTimestamp)
    })

    expect(result.current.startDate).toBe('2022-01-01T00:00:00.000Z')
    expect(result.current.endDate).toBe('2022-01-02T00:00:00.000Z')
    expect(result.current.hasCalendarValue).toBe(true)
  })
})

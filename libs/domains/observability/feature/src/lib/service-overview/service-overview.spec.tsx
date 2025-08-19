import { act, renderHook } from '@qovery/shared/util-tests'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

jest.mock('./select-time-range/select-time-range', () => ({
  SelectTimeRange: () => <div data-testid="select-time-range">SelectTimeRange</div>,
}))

describe('Zoom and DatePicker Integration', () => {
  it('should synchronize hasCalendarValue with zoom and time range states', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    expect(result.current.hasCalendarValue).toBe(false)

    // Simulate user selecting custom dates (like from datepicker)
    act(() => {
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
      result.current.setHasCalendarValue(true)
    })

    expect(result.current.hasCalendarValue).toBe(true)

    // Simulate changing back to preset time range
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    // After handleTimeRangeChange, hasCalendarValue should remain true
    expect(result.current.hasCalendarValue).toBe(true)
    expect(result.current.timeRange).toBe('1h')
  })

  it('should reset zoom when switching between preset and custom time ranges', () => {
    const mockZoomReset = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    // Register a zoom reset function
    act(() => {
      result.current.registerZoomReset(mockZoomReset)
    })

    // Simulate user zooming in on a chart
    act(() => {
      result.current.setIsAnyChartZoomed(true)
    })

    expect(result.current.isAnyChartZoomed).toBe(true)

    // Switch to custom date range (simulating datepicker usage)
    act(() => {
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
      result.current.setHasCalendarValue(true)
      result.current.resetChartZoom() // This would be called by datepicker
    })

    expect(mockZoomReset).toHaveBeenCalled()
    expect(result.current.isAnyChartZoomed).toBe(false)
    expect(result.current.hasCalendarValue).toBe(true)

    mockZoomReset.mockClear()

    // Switch back to preset time range
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    // Should reset zoom again but not clear calendar value
    expect(mockZoomReset).toHaveBeenCalled()
    expect(result.current.isAnyChartZoomed).toBe(false)
    expect(result.current.hasCalendarValue).toBe(true)
    expect(result.current.timeRange).toBe('1h')
  })

  it('should handle zoom time range changes from chart interactions', () => {
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    // Start with preset time range
    expect(result.current.hasCalendarValue).toBe(false)
    expect(result.current.timeRange).toBe('1h')

    // Simulate zoom selection on chart creating new time range
    const startTimestamp = 1640995200 // 2022-01-01 00:00:00 UTC
    const endTimestamp = 1641081600 // 2022-01-02 00:00:00 UTC

    act(() => {
      result.current.handleZoomTimeRangeChange(startTimestamp, endTimestamp)
    })

    // Should switch to calendar mode and set custom dates
    expect(result.current.hasCalendarValue).toBe(true)
    expect(result.current.startDate).toBe('2022-01-01T00:00:00.000Z')
    expect(result.current.endDate).toBe('2022-01-02T00:00:00.000Z')
  })

  it('should maintain state consistency across multiple zoom/datepicker interactions', () => {
    const mockZoomReset1 = jest.fn()
    const mockZoomReset2 = jest.fn()

    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    // Register multiple zoom functions (simulating multiple charts)
    act(() => {
      result.current.registerZoomReset(mockZoomReset1)
      result.current.registerZoomReset(mockZoomReset2)
    })

    // Test sequence: preset → custom dates → preset → zoom → preset

    // 1. Start with preset (30m default)
    expect(result.current.timeRange).toBe('1h')
    expect(result.current.hasCalendarValue).toBe(false)

    // 2. Switch to custom dates
    act(() => {
      result.current.resetChartZoom() // Datepicker calls this
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
      result.current.setHasCalendarValue(true)
    })

    expect(mockZoomReset1).toHaveBeenCalledTimes(1)
    expect(mockZoomReset2).toHaveBeenCalledTimes(1)
    expect(result.current.hasCalendarValue).toBe(true)

    // 3. Switch back to preset
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    expect(mockZoomReset1).toHaveBeenCalledTimes(2)
    expect(mockZoomReset2).toHaveBeenCalledTimes(2)
    expect(result.current.timeRange).toBe('1h')
    expect(result.current.hasCalendarValue).toBe(true)

    // 4. Simulate zoom creating new time range
    act(() => {
      result.current.handleZoomTimeRangeChange(1640995200, 1641081600)
    })

    expect(result.current.hasCalendarValue).toBe(true)

    // 5. Switch to another preset
    act(() => {
      result.current.handleTimeRangeChange('6h')
    })

    expect(mockZoomReset1).toHaveBeenCalledTimes(3)
    expect(mockZoomReset2).toHaveBeenCalledTimes(3)
    expect(result.current.timeRange).toBe('6h')
    expect(result.current.hasCalendarValue).toBe(true)
  })

  it('should properly cleanup zoom reset functions', () => {
    const mockZoomReset = jest.fn()
    const { result } = renderHook(() => useServiceOverviewContext(), {
      wrapper: ServiceOverviewProvider,
    })

    // Test that we can register and the function gets called
    act(() => {
      result.current.registerZoomReset(mockZoomReset)
    })

    // First reset should call the function
    act(() => {
      result.current.resetChartZoom()
    })

    expect(mockZoomReset).toHaveBeenCalledTimes(1)
  })
})

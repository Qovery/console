import { act, renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceOverviewProvider, useServiceOverviewContext } from './service-overview-context'

describe('ServiceOverviewContext', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useServiceOverviewContext()
      return <div>Test</div>
    }

    expect(() => renderWithProviders(<TestComponent />)).toThrow(
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

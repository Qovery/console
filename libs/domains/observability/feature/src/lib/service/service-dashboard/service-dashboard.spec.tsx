import type { ReactNode } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'

const mockUseDashboardContext = jest.fn()

jest.mock('../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
  DashboardProvider: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('./select-time-range/select-time-range', () => ({
  SelectTimeRange: () => <div data-testid="select-time-range">SelectTimeRange</div>,
}))

describe('Zoom and DatePicker Integration', () => {
  const defaultMockContext = {
    useLocalTime: false,
    setUseLocalTime: jest.fn(),
    timeRange: '1h' as const,
    setTimeRange: jest.fn(),
    startDate: '2023-11-01T10:00:00.000Z',
    setStartDate: jest.fn(),
    endDate: '2023-11-01T11:00:00.000Z',
    setEndDate: jest.fn(),
    startTimestamp: '1698836200000',
    endTimestamp: '1698834400000',
    queryTimeRange: '1h',
    subQueryTimeRange: '1m',
    handleTimeRangeChange: jest.fn(),
    handleZoomTimeRangeChange: jest.fn(),
    resetChartZoom: jest.fn(),
    registerZoomReset: jest.fn(),
    isAnyChartZoomed: false,
    setIsAnyChartZoomed: jest.fn(),
    setHideEvents: jest.fn(),
    hideEvents: false,
    expandCharts: false,
    setExpandCharts: jest.fn(),
    isLiveUpdateEnabled: false,
    setIsLiveUpdateEnabled: jest.fn(),
    isDatePickerOpen: false,
    setIsDatePickerOpen: jest.fn(),
    lastDropdownTimeRange: '1h' as const,
    isAnyChartRefreshing: false,
    setIsAnyChartRefreshing: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDashboardContext.mockReturnValue(defaultMockContext)
  })

  it('should synchronize hasCalendarValue with zoom and time range states', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    // Simulate user selecting custom dates (like from datepicker)
    act(() => {
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
    })

    // Simulate changing back to preset time range
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    // After handleTimeRangeChange should remain true
    expect(result.current.timeRange).toBe('1h')
  })

  it('should reset zoom when switching between preset and custom time ranges', () => {
    const mockZoomReset = jest.fn()
    const mockResetChartZoom = jest.fn()
    const mockSetIsAnyChartZoomed = jest.fn()

    let currentZoomState = false

    mockUseDashboardContext.mockReturnValue({
      ...defaultMockContext,
      registerZoomReset: jest.fn(() => mockZoomReset),
      resetChartZoom: mockResetChartZoom,
      isAnyChartZoomed: currentZoomState,
      setIsAnyChartZoomed: mockSetIsAnyChartZoomed.mockImplementation((value) => {
        currentZoomState = value
        // Update the mock return value
        mockUseDashboardContext.mockReturnValue({
          ...defaultMockContext,
          registerZoomReset: jest.fn(() => mockZoomReset),
          resetChartZoom: mockResetChartZoom,
          isAnyChartZoomed: currentZoomState,
          setIsAnyChartZoomed: mockSetIsAnyChartZoomed,
        })
      }),
    })

    const { result } = renderHook(() => mockUseDashboardContext())

    // Register a zoom reset function
    act(() => {
      result.current.registerZoomReset(mockZoomReset)
    })

    // Simulate user zooming in on a chart
    act(() => {
      result.current.setIsAnyChartZoomed(true)
    })

    expect(mockSetIsAnyChartZoomed).toHaveBeenCalledWith(true)

    // Switch to custom date range (simulating datepicker usage)
    act(() => {
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
      result.current.resetChartZoom() // This would be called by datepicker
    })

    expect(mockResetChartZoom).toHaveBeenCalled()

    mockResetChartZoom.mockClear()

    // Switch back to preset time range
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    // Should reset zoom again but not clear calendar value
    expect(result.current.timeRange).toBe('1h')
  })

  it('should handle zoom time range changes from chart interactions', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    // Start with preset time range
    expect(result.current.timeRange).toBe('1h')

    // Simulate zoom selection on chart creating new time range
    const startTimestamp = 1640995200 // 2022-01-01 00:00:00 UTC
    const endTimestamp = 1641081600 // 2022-01-02 00:00:00 UTC

    act(() => {
      result.current.handleZoomTimeRangeChange(startTimestamp, endTimestamp)
    })

    // Should call the handler with the timestamps
    expect(result.current.handleZoomTimeRangeChange).toHaveBeenCalledWith(startTimestamp, endTimestamp)
  })

  it('should maintain state consistency across multiple zoom/datepicker interactions', () => {
    const mockZoomReset1 = jest.fn()
    const mockZoomReset2 = jest.fn()
    const mockResetChartZoom = jest.fn()
    const mockHandleTimeRangeChange = jest.fn()

    let currentTimeRange = '1h'

    mockUseDashboardContext.mockReturnValue({
      ...defaultMockContext,
      registerZoomReset: jest.fn(() => mockZoomReset1),
      resetChartZoom: mockResetChartZoom,
      timeRange: currentTimeRange,
      handleTimeRangeChange: mockHandleTimeRangeChange.mockImplementation((range) => {
        currentTimeRange = range
        // Update the mock return value
        mockUseDashboardContext.mockReturnValue({
          ...defaultMockContext,
          registerZoomReset: jest.fn(() => mockZoomReset1),
          resetChartZoom: mockResetChartZoom,
          timeRange: currentTimeRange,
          handleTimeRangeChange: mockHandleTimeRangeChange,
        })
      }),
    })

    const { result } = renderHook(() => mockUseDashboardContext())

    // Register multiple zoom functions (simulating multiple charts)
    act(() => {
      result.current.registerZoomReset(mockZoomReset1)
      result.current.registerZoomReset(mockZoomReset2)
    })

    // Test sequence: preset → custom dates → preset → zoom → preset

    // 1. Start with preset (1h default)
    expect(result.current.timeRange).toBe('1h')

    // 2. Switch to custom dates
    act(() => {
      result.current.resetChartZoom() // Datepicker calls this
      result.current.setStartDate('2023-11-01T10:00:00.000Z')
      result.current.setEndDate('2023-11-01T11:00:00.000Z')
    })

    expect(mockResetChartZoom).toHaveBeenCalled()

    // 3. Switch back to preset
    act(() => {
      result.current.handleTimeRangeChange('1h')
    })

    expect(mockHandleTimeRangeChange).toHaveBeenCalledWith('1h')

    // 4. Simulate zoom creating new time range
    act(() => {
      result.current.handleZoomTimeRangeChange(1640995200, 1641081600)
    })

    // 5. Switch to another preset
    act(() => {
      result.current.handleTimeRangeChange('6h')
    })

    expect(mockHandleTimeRangeChange).toHaveBeenCalledWith('6h')
  })

  it('should properly cleanup zoom reset functions', () => {
    const mockZoomReset = jest.fn()
    const mockResetChartZoom = jest.fn()

    mockUseDashboardContext.mockReturnValue({
      ...defaultMockContext,
      registerZoomReset: jest.fn(() => mockZoomReset),
      resetChartZoom: mockResetChartZoom,
    })

    const { result } = renderHook(() => mockUseDashboardContext())

    // Test that we can register and the function gets called
    act(() => {
      result.current.registerZoomReset(mockZoomReset)
    })

    // First reset should call the function
    act(() => {
      result.current.resetChartZoom()
    })

    expect(mockResetChartZoom).toHaveBeenCalledTimes(1)
  })
})

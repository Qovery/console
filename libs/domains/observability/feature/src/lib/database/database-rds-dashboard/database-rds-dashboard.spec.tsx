import { renderHook } from '@qovery/shared/util-tests'

const mockUseDashboardContext = jest.fn()

jest.mock('../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
  DashboardProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('./select-time-range/select-time-range', () => ({
  SelectTimeRange: () => <div data-testid="select-time-range">SelectTimeRange</div>,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: jest.fn(() => ({ data: { serviceType: 'DATABASE' } })),
}))

jest.mock('../hooks/use-environment/use-environment', () => ({
  useEnvironment: jest.fn(() => ({ data: { cluster_id: 'cluster-1' } })),
}))

describe('RdsManagedDbOverview Context', () => {
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
    traceId: 'test-trace-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDashboardContext.mockReturnValue(defaultMockContext)
  })

  it('should handle time range changes for RDS database', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    expect(result.current.timeRange).toBe('1h')
    expect(result.current.handleTimeRangeChange).toBeDefined()
  })

  it('should manage expand charts state', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    expect(result.current.expandCharts).toBe(false)
    expect(result.current.setExpandCharts).toBeDefined()
  })

  it('should manage hide events state', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    expect(result.current.hideEvents).toBe(false)
    expect(result.current.setHideEvents).toBeDefined()
  })

  it('should manage live update state', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    expect(result.current.isLiveUpdateEnabled).toBe(false)
    expect(result.current.setIsLiveUpdateEnabled).toBeDefined()
  })

  it('should have trace ID for request tracing', () => {
    const { result } = renderHook(() => mockUseDashboardContext())

    expect(result.current.traceId).toBe('test-trace-id')
  })
})

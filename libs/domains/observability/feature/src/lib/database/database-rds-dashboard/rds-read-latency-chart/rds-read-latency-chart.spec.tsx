import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsReadLatencyChart } from './rds-read-latency-chart'

const mockUseDashboardContext = jest.fn()
const mockUseMetrics = jest.fn()
const mockUseInstantMetrics = jest.fn()

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('../../../hooks/use-metrics/use-metrics', () => ({
  useMetrics: () => mockUseMetrics(),
}))

jest.mock('../../../hooks/use-instant-metrics/use-instant-metrics', () => ({
  useInstantMetrics: () => mockUseInstantMetrics(),
}))

describe('RdsReadLatencyChart', () => {
  beforeEach(() => {
    mockUseDashboardContext.mockReturnValue({
      startTimestamp: '1698834400',
      endTimestamp: '1698838000',
      useLocalTime: false,
      timeRange: '1h',
      handleZoomTimeRangeChange: jest.fn(),
      registerZoomReset: jest.fn(),
      setIsAnyChartZoomed: jest.fn(),
      handleTimeRangeChange: jest.fn(),
      lastDropdownTimeRange: '1h',
      isAnyChartRefreshing: false,
    })

    mockUseMetrics.mockReturnValue({
      data: null,
      isLoading: false,
    })

    mockUseInstantMetrics.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { container } = renderWithProviders(
      <RdsReadLatencyChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })

  it('should render with metrics data', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              metric: {},
              values: [
                [1698834400, '0.005'],
                [1698834460, '0.008'],
              ],
            },
          ],
        },
      },
      isLoading: false,
    })

    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1698834400, '0.010'],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsReadLatencyChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

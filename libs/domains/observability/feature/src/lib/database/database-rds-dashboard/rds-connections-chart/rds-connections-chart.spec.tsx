import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsConnectionsChart } from './rds-connections-chart'

const mockUseDashboardContext = jest.fn()
const mockUseMetrics = jest.fn()

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('../../../hooks/use-metrics/use-metrics', () => ({
  useMetrics: () => mockUseMetrics(),
}))

describe('RdsConnectionsChart', () => {
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
  })

  it('should render successfully', () => {
    const { container } = renderWithProviders(
      <RdsConnectionsChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
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
                [1698834400, '25'],
                [1698834460, '30'],
              ],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsConnectionsChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsDiskQueueDepthChart } from './rds-disk-queue-depth-chart'

const mockUseRdsManagedDbContext = jest.fn()
const mockUseRdsMetrics = jest.fn()

jest.mock('../../rds-managed-db/util-filter/rds-managed-db-context', () => ({
  useRdsManagedDbContext: () => mockUseRdsManagedDbContext(),
}))

jest.mock('../../rds-managed-db/hooks/use-rds-metrics/use-rds-metrics', () => ({
  useRdsMetrics: () => mockUseRdsMetrics(),
}))

describe('RdsDiskQueueDepthChart', () => {
  beforeEach(() => {
    mockUseRdsManagedDbContext.mockReturnValue({
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

    mockUseRdsMetrics.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { container } = renderWithProviders(
      <RdsDiskQueueDepthChart clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })

  it('should render with metrics data', () => {
    mockUseRdsMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              metric: {},
              values: [
                [1698834400, '2.5'],
                [1698834460, '1.8'],
              ],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsDiskQueueDepthChart clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

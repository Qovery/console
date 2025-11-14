import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsWriteIopChart } from './rds-write-iop-chart'

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

describe('RdsWriteIopChart', () => {
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
      <RdsWriteIopChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
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
                [1698834400, '85.3'],
                [1698834460, '92.1'],
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
              value: [1698834400, '88.7'],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsWriteIopChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

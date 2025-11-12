import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsReadIopChart } from './rds-read-iop-chart'

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

describe('RdsReadIopChart', () => {
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
      <RdsReadIopChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
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
                [1698834400, '150.5'],
                [1698834460, '200.2'],
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
              value: [1698834400, '175.5'],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsReadIopChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

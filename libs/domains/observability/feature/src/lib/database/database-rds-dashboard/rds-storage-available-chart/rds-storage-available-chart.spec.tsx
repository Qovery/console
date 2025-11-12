import { renderWithProviders } from '@qovery/shared/util-tests'
import { RdsStorageAvailableChart } from './rds-storage-available-chart'

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

describe('RdsStorageAvailableChart', () => {
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
      <RdsStorageAvailableChart
        serviceId="service-1"
        clusterId="cluster-1"
        dbInstance="zb4b3b048-postgresql"
        storageResourceInGiB={100}
      />
    )
    expect(container).toBeTruthy()
  })

  it('should render with metrics data', () => {
    const storageGiB = 100
    const freeBytes = storageGiB * 0.5 * 1024 * 1024 * 1024 // 50% free

    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              metric: {},
              values: [
                [1698834400, freeBytes.toString()],
                [1698834460, (freeBytes * 0.9).toString()],
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
              value: [1698834400, freeBytes.toString()],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsStorageAvailableChart
        serviceId="service-1"
        clusterId="cluster-1"
        dbInstance="zb4b3b048-postgresql"
        storageResourceInGiB={storageGiB}
      />
    )
    expect(container).toBeTruthy()
  })

  it('should handle missing storageResourceInGiB', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              metric: {},
              values: [[1698834400, '50000000000']],
            },
          ],
        },
      },
      isLoading: false,
    })

    const { container } = renderWithProviders(
      <RdsStorageAvailableChart serviceId="service-1" clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />
    )
    expect(container).toBeTruthy()
  })
})

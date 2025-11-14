import { render } from '@qovery/shared/util-tests'
import { CardSwapUsage } from './card-max-swap-usage'

const mockUseDashboardContext = jest.fn()
const mockUseInstantMetrics = jest.fn()
const mockCardMetric = jest.fn(() => <div data-testid="card-metric" />)

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('../../../hooks/use-instant-metrics/use-instant-metrics', () => ({
  useInstantMetrics: (params: unknown) => mockUseInstantMetrics(params),
}))

jest.mock('../card-metric/card-metric', () => ({
  CardMetric: (props: unknown) => mockCardMetric(props),
}))

describe('CardSwapUsage', () => {
  const defaultContext = {
    startTimestamp: '1698834400',
    endTimestamp: '1698838000',
    timeRange: '1h',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDashboardContext.mockReturnValue(defaultContext)
    mockUseInstantMetrics.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  const renderComponent = () => render(<CardSwapUsage clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)

  it('should render successfully with default values', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Swap Usage',
        value: '--',
        unit: 'KiB',
        valueDescription: 'Maximum swap used',
        description: "Maximum swap usage on the database instance's disk.",
        isLoading: false,
      })
    )
  })

  it('should convert bytes to KiB and format value', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, `${512 * 1024}`],
            },
          ],
        },
      },
      isLoading: false,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        value: '512',
      })
    )
  })

  it('should forward loading state', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }))
  })

  it('should set GREEN status for low swap usage', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, `${32 * 1024 * 1024}`], // 32 MiB < 64 MiB
            },
          ],
        },
      },
      isLoading: false,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(expect.objectContaining({ status: 'GREEN' }))
  })

  it('should set YELLOW status for moderate swap usage', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, `${128 * 1024 * 1024}`], // 128 MiB (64-512 MiB range)
            },
          ],
        },
      },
      isLoading: false,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(expect.objectContaining({ status: 'YELLOW' }))
  })

  it('should set RED status for high swap usage', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, `${600 * 1024 * 1024}`], // 600 MiB > 512 MiB
            },
          ],
        },
      },
      isLoading: false,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(expect.objectContaining({ status: 'RED' }))
  })
})

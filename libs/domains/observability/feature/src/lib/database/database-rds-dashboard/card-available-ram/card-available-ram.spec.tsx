import { render } from '@qovery/shared/util-tests'
import { CardAvailableRam } from './card-available-ram'

const mockUseDashboardContext = jest.fn()
const mockUseMetrics = jest.fn()
const mockCardMetric = jest.fn(() => <div data-testid="card-metric" />)

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('../../../hooks/use-metrics/use-metrics', () => ({
  useMetrics: (params: unknown) => mockUseMetrics(params),
}))

jest.mock('../card-metric/card-metric', () => ({
  CardMetric: (props: unknown) => mockCardMetric(props),
}))

describe('CardAvailableRam', () => {
  const defaultContext = {
    startTimestamp: '1698834400',
    endTimestamp: '1698838000',
    timeRange: '1h',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDashboardContext.mockReturnValue(defaultContext)
    mockUseMetrics.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  const renderComponent = () => render(<CardAvailableRam clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)

  it('should render successfully with default values', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Available RAM',
        value: '--',
        unit: 'GB',
        valueDescription: 'avg free memory',
        description: 'Average free memory available over the selected time range.',
        isLoading: false,
      })
    )
  })

  it('should convert bytes to gigabytes and format value', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, `${2 * 1024 * 1024 * 1024}`],
                [2, `${4.25 * 1024 * 1024 * 1024}`],
              ],
            },
          ],
        },
      },
      isLoading: false,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        value: '4.25',
      })
    )
  })

  it('should forward loading state', () => {
    mockUseMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }))
  })
})

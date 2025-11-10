import { render } from '@qovery/shared/util-tests'
import { CardUnvacuumedTransactions } from './card-unvacuumed-transactions'

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

describe('CardUnvacuumedTransactions', () => {
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

  const renderComponent = () => render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)

  it('should render successfully with default props', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unvacuumed Transactions',
        value: '--',
        valueDescription: 'pending cleanup operations',
        isLoading: false,
      })
    )
  })

  it('should format values using short number notation and compute status', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, `${450_000_000}`],
                [2, `${525_000_000}`],
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
        value: '525.0M',
        status: 'YELLOW',
      })
    )
  })

  it('should surface RED status when transaction backlog is critical', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, `${900_000_000}`],
                [2, `${1_250_000_000}`],
              ],
            },
          ],
        },
      },
      isLoading: true,
    })

    renderComponent()

    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        value: '1.3B',
        status: 'RED',
        isLoading: true,
      })
    )
  })
})

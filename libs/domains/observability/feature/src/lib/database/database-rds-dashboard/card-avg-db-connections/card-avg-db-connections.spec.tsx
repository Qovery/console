import { render } from '@qovery/shared/util-tests'
import { CardAvgDbConnections } from './card-avg-db-connections'

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

describe('CardAvgDbConnections', () => {
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

  const renderComponent = () => render(<CardAvgDbConnections clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)

  it('should render successfully with default props', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Database Connections',
        value: '--',
        valueDescription: 'avg active connections',
        description: 'Average number of active database connections over the selected time range.',
        isLoading: false,
      })
    )
  })

  it('should round value and set GREEN status for low connection counts', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, '74.6'],
                [2, '79.4'],
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
        value: '79',
        status: 'GREEN',
      })
    )
  })

  it('should set RED status when connections exceed critical threshold', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, '120'],
                [2, '175'],
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
        value: '175',
        status: 'RED',
        isLoading: true,
      })
    )
  })
})

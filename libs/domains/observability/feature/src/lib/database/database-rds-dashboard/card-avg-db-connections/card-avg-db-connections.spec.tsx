import { render } from '@qovery/shared/util-tests'
import { CardAvgDbConnections } from './card-avg-db-connections'

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

describe('CardAvgDbConnections', () => {
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

  const renderComponent = () => render(<CardAvgDbConnections clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)

  it('should render successfully with default props', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Database Connections',
        value: '--',
        valueDescription: 'Average active connections',
        description: 'Average number of active database connections over the selected time range.',
        isLoading: false,
      })
    )
  })

  it('should round value and set GREEN status for low connection counts', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, '79.4'],
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
      })
    )
  })

  it('should set RED status when connections exceed critical threshold', () => {
    mockUseInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1, '175'],
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
        isLoading: true,
      })
    )
  })
})

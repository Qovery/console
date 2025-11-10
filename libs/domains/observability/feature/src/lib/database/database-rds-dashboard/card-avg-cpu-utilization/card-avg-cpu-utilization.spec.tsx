import { render } from '@qovery/shared/util-tests'
import { CardAvgCpuUtilization } from './card-avg-cpu-utilization'

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

describe('CardAvgCpuUtilization', () => {
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

  const renderComponent = () =>
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)

  it('should render successfully', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
    expect(mockCardMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'CPU Utilization',
        value: '--',
        unit: '%',
        valueDescription: 'avg CPU usage',
        description: 'Average CPU utilization over the selected time range.',
        isLoading: false,
      })
    )
  })

  it('should format value and set GREEN status when average CPU is below threshold', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, '60'],
                [2, '68.42'],
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
        value: '68.4',
        status: 'GREEN',
      })
    )
  })

  it('should set RED status when CPU utilization is high', () => {
    mockUseMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              values: [
                [1, '82'],
                [2, '91.5'],
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
        value: '91.5',
        status: 'RED',
        isLoading: true,
      })
    )
  })
})

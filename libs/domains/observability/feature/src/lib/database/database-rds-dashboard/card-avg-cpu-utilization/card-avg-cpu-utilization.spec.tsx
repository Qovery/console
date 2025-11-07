import { render, screen } from '@qovery/shared/util-tests'
import { CardAvgCpuUtilization } from './card-avg-cpu-utilization'

const mockUseDashboardContext = jest.fn()
const mockUseMetrics = jest.fn()

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('../../../hooks/use-metrics/use-metrics', () => ({
  useMetrics: () => mockUseMetrics(),
}))

jest.mock('../card-rds-metric/card-rds-metric', () => ({
  CardRdsMetric: ({ title, description, unit }: { title: string; description: string; unit?: string }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      {unit && <span>{unit}</span>}
    </div>
  ),
}))

describe('CardAvgCpuUtilization', () => {
  beforeEach(() => {
    mockUseDashboardContext.mockReturnValue({
      startTimestamp: '1698834400',
      endTimestamp: '1698838000',
      timeRange: '1h',
    })

    mockUseMetrics.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { container } = render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('avg CPU Utilization')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('average CPU usage')).toBeInTheDocument()
  })

  it('should render unit', () => {
    render(<CardAvgCpuUtilization clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})

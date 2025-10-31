import { render, screen } from '@qovery/shared/util-tests'
import { CardAvgDbConnections } from './card-avg-db-connections'

const mockUseRdsManagedDbContext = jest.fn()
const mockUseRdsInstantMetrics = jest.fn()

jest.mock('../../rds-managed-db/util-filter/rds-managed-db-context', () => ({
  useRdsManagedDbContext: () => mockUseRdsManagedDbContext(),
}))

jest.mock('../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics', () => ({
  useRdsInstantMetrics: () => mockUseRdsInstantMetrics(),
}))

jest.mock('../card-rds-metric/card-rds-metric', () => ({
  CardRdsMetric: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}))

describe('CardAvgDbConnections', () => {
  beforeEach(() => {
    mockUseRdsManagedDbContext.mockReturnValue({
      startTimestamp: '1698834400',
      endTimestamp: '1698838000',
      timeRange: '1h',
    })

    mockUseRdsInstantMetrics.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { container } = render(<CardAvgDbConnections clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardAvgDbConnections clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('avg Database Connections')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardAvgDbConnections clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('average active connections')).toBeInTheDocument()
  })
})

import { render, screen } from '@qovery/shared/util-tests'
import { CardAvailableRam } from './card-available-ram'

const mockUseRdsManagedDbContext = jest.fn()
const mockUseRdsInstantMetrics = jest.fn()

jest.mock('../../rds-managed-db/util-filter/rds-managed-db-context', () => ({
  useRdsManagedDbContext: () => mockUseRdsManagedDbContext(),
}))

jest.mock('../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics', () => ({
  useRdsInstantMetrics: () => mockUseRdsInstantMetrics(),
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

describe('CardAvailableRam', () => {
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
    const { container } = render(<CardAvailableRam clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardAvailableRam clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('Available RAM on Instances')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardAvailableRam clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('free memory available')).toBeInTheDocument()
  })

  it('should render unit', () => {
    render(<CardAvailableRam clusterId="cluster-1" dbInstance="zb4b3b048-postgresql" />)
    expect(screen.getByText('GB')).toBeInTheDocument()
  })
})

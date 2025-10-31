import { render, screen } from '@qovery/shared/util-tests'
import { CardUnvacuumedTransactions } from './card-unvacuumed-transactions'

const mockUseRdsManagedDbContext = jest.fn()
const mockUseRdsInstantMetrics = jest.fn()

jest.mock('../../rds-managed-db/util-filter/rds-managed-db-context', () => ({
  useRdsManagedDbContext: () => mockUseRdsManagedDbContext(),
}))

jest.mock('../../rds-managed-db/hooks/use-rds-instant-metrics/use-rds-instant-metrics', () => ({
  useRdsInstantMetrics: () => mockUseRdsInstantMetrics(),
}))

jest.mock('../card-rds-metric/card-rds-metric', () => ({
  CardRdsMetric: ({ title, description, value }: { title: string; description: string; value: string | number }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{value}</span>
    </div>
  ),
}))

describe('CardUnvacuumedTransactions', () => {
  beforeEach(() => {
    mockUseRdsManagedDbContext.mockReturnValue({
      queryTimeRange: '1h',
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
    const { container } = render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)
    expect(container).toBeTruthy()
  })

  it('should render title', () => {
    render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)
    expect(screen.getByText('Unvacuumed Transactions (highest avg)')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)
    expect(
      screen.getByText('Backlog of database transactions needing cleanup. PostgreSQL can handle max 2 billion')
    ).toBeInTheDocument()
  })

  it('should show placeholder when no data', () => {
    render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('should display metrics value when available', () => {
    mockUseRdsInstantMetrics.mockReturnValue({
      data: {
        data: {
          result: [
            {
              value: [1698838000, '500000000'],
            },
          ],
        },
      },
      isLoading: false,
    })

    render(<CardUnvacuumedTransactions clusterId="cluster-1" dbInstance="my-db-instance" />)
    expect(screen.getByText('500.0M')).toBeInTheDocument()
  })
})

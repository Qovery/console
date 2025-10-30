import { render, screen } from '@qovery/shared/util-tests'
import { CardAvgDbConnections } from './card-avg-db-connections'

jest.mock('../card-rds-metric/card-rds-metric', () => ({
  CardRdsMetric: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}))

describe('CardAvgDbConnections', () => {
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

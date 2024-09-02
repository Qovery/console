import { type Cluster } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterCard } from './cluster-card'

const mockCluster = {
  id: 'cluster-id',
  name: 'Test Cluster',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  production: true,
  is_default: false,
  kubernetes: 'MANAGED',
  region: 'us-east-1',
  version: '1.21',
  instance_type: 't3.medium',
} as Cluster

describe('ClusterCard', () => {
  it('should render correctly', () => {
    const { container } = renderWithProviders(
      <ClusterCard
        cluster={mockCluster}
        clusterStatus={{
          status: 'DEPLOYED',
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should display cluster name', () => {
    renderWithProviders(
      <ClusterCard
        cluster={mockCluster}
        clusterStatus={{
          status: 'DEPLOYED',
        }}
      />
    )
    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('should display cluster status', () => {
    renderWithProviders(
      <ClusterCard
        cluster={mockCluster}
        clusterStatus={{
          status: 'DEPLOYED',
        }}
      />
    )

    expect(screen.getByText('Deployed')).toBeInTheDocument()
  })

  it('should display production badge', () => {
    renderWithProviders(
      <ClusterCard
        cluster={mockCluster}
        clusterStatus={{
          status: 'DEPLOYED',
        }}
      />
    )
    expect(screen.getByText('Production')).toBeInTheDocument()
  })

  it('should display cluster details', () => {
    renderWithProviders(
      <ClusterCard
        cluster={mockCluster}
        clusterStatus={{
          status: 'DEPLOYED',
        }}
      />
    )
    expect(screen.getByText('Qovery managed')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('1.21')).toBeInTheDocument()
    expect(screen.getByText('t3.medium')).toBeInTheDocument()
  })
})

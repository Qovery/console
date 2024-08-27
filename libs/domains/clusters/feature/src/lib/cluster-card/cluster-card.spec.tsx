import { type Cluster } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterStatus } from '../hooks/use-cluster-status/use-cluster-status'
import { ClusterCard } from './cluster-card'

jest.mock('../hooks/use-cluster-status/use-cluster-status')

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
  beforeEach(() => {
    useClusterStatus.mockReturnValue({
      data: {
        status: 'RUNNING',
      },
      isLoading: false,
    })
  })

  it('should render correctly', () => {
    const { container } = renderWithProviders(<ClusterCard organizationId="org-id" cluster={mockCluster} />)
    expect(container).toMatchSnapshot()
  })

  it('should display cluster name', () => {
    renderWithProviders(<ClusterCard organizationId="org-id" cluster={mockCluster} />)
    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('should display cluster status', () => {
    renderWithProviders(<ClusterCard organizationId="org-id" cluster={mockCluster} />)
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('should display production badge', () => {
    renderWithProviders(<ClusterCard organizationId="org-id" cluster={mockCluster} />)
    expect(screen.getByText('Production')).toBeInTheDocument()
  })

  it('should display cluster details', () => {
    renderWithProviders(<ClusterCard organizationId="org-id" cluster={mockCluster} />)
    expect(screen.getByText('Qovery managed')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('1.21')).toBeInTheDocument()
    expect(screen.getByText('t3.medium')).toBeInTheDocument()
  })
})

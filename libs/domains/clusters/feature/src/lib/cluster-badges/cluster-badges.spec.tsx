import { type Cluster, type ClusterFeatureResponseValueObject } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterBadges } from './cluster-badges'

const baseCluster = {
  id: 'cluster-id',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  kubernetes: 'MANAGED',
  region: 'us-east-1',
  version: '1.21',
  instance_type: 'KARPENTER',
} as Cluster

describe('ClusterBadges', () => {
  it('should render the same managed badges as the cluster card', () => {
    renderWithProviders(<ClusterBadges cluster={baseCluster} />)

    expect(screen.getByText('Qovery managed')).toBeInTheDocument()
    expect(screen.getByText('EKS (Karpenter)')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('1.21')).toBeInTheDocument()
  })

  it('should render self managed badges', () => {
    renderWithProviders(<ClusterBadges cluster={{ ...baseCluster, kubernetes: 'SELF_MANAGED' } as Cluster} />)

    expect(screen.getByText('Self managed')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.queryByText('Qovery managed')).not.toBeInTheDocument()
  })

  it('should not render the Kubernetes version badge for partially managed clusters', () => {
    renderWithProviders(
      <ClusterBadges cluster={{ ...baseCluster, kubernetes: 'PARTIALLY_MANAGED' } as Cluster} />
    )

    expect(screen.queryByText('1.21')).not.toBeInTheDocument()
  })

  it('should render GPU pool badge when a GPU pool is configured', () => {
    renderWithProviders(
      <ClusterBadges
        cluster={
          {
            ...baseCluster,
            features: [
              {
                id: 'KARPENTER',
                value_object: { value: { qovery_node_pools: { gpu_override: true } } },
              } as unknown as ClusterFeatureResponseValueObject,
            ],
          } as Cluster
        }
      />
    )

    expect(screen.getByText('GPU pool')).toBeInTheDocument()
  })
})

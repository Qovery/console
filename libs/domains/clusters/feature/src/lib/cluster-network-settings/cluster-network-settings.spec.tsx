import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Cluster, type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterRoutingTable } from '../hooks/use-cluster-routing-table/use-cluster-routing-table'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { useEditCluster } from '../hooks/use-edit-cluster/use-edit-cluster'
import { useEditRoutingTable } from '../hooks/use-edit-routing-table/use-edit-routing-table'
import { ClusterNetworkSettings } from './cluster-network-settings'

jest.mock('../hooks/use-cluster/use-cluster')
jest.mock('../hooks/use-cluster-routing-table/use-cluster-routing-table')
jest.mock('../hooks/use-edit-cluster/use-edit-cluster')
jest.mock('../hooks/use-edit-routing-table/use-edit-routing-table')

const mockUseCluster = useCluster as jest.MockedFunction<typeof useCluster>
const mockUseClusterRoutingTable = useClusterRoutingTable as jest.MockedFunction<typeof useClusterRoutingTable>
const mockUseEditCluster = useEditCluster as jest.MockedFunction<typeof useEditCluster>
const mockUseEditRoutingTable = useEditRoutingTable as jest.MockedFunction<typeof useEditRoutingTable>

const mockCluster: Cluster = {
  id: 'cluster-id',
  name: 'test-cluster',
  cloud_provider: 'AWS',
  kubernetes: 'MANAGED',
  production: false,
  region: 'us-east-1',
  features: [],
  created_at: new Date().toISOString(),
  organization: {
    id: 'org-id',
    name: 'test-org',
  },
} as Cluster

const mockClusterScaleway: Cluster = {
  ...mockCluster,
  cloud_provider: 'SCW',
  region: 'fr-par',
  features: [
    {
      id: 'STATIC_IP',
      value_object: {
        value: true,
      },
    },
    {
      id: 'NAT_GATEWAY',
      value_object: {
        value: {
          nat_gateway_type: {
            type: 'sbn',
          },
        },
      },
    },
  ],
} as Cluster

const mockRoutes: ClusterRoutingTableResultsInner[] = [
  {
    target: '10.0.0.0/16',
    destination: 'pcx-123456',
    description: 'Test route',
  },
]

describe('ClusterNetworkSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEditCluster.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useEditCluster>)
    mockUseEditRoutingTable.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useEditRoutingTable>)
  })

  it('should render loading state', () => {
    mockUseCluster.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useCluster>)
    mockUseClusterRoutingTable.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useClusterRoutingTable>)

    renderWithProviders(
      wrapWithReactHookForm(<ClusterNetworkSettings organizationId="org-id" clusterId="cluster-id" />)
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render routes section for AWS managed cluster', () => {
    mockUseCluster.mockReturnValue({
      data: mockCluster,
      isLoading: false,
    } as unknown as ReturnType<typeof useCluster>)
    mockUseClusterRoutingTable.mockReturnValue({
      data: mockRoutes,
      isLoading: false,
    } as unknown as ReturnType<typeof useClusterRoutingTable>)

    renderWithProviders(
      wrapWithReactHookForm(<ClusterNetworkSettings organizationId="org-id" clusterId="cluster-id" />)
    )

    expect(screen.getByText('Routes')).toBeInTheDocument()
    expect(screen.getByText('Target:')).toBeInTheDocument()
    expect(screen.getByText('10.0.0.0/16')).toBeInTheDocument()
    expect(screen.getByText('Destination:')).toBeInTheDocument()
    expect(screen.getByText('pcx-123456')).toBeInTheDocument()
  })

  it('should render Scaleway static IP for Scaleway cluster', () => {
    mockUseCluster.mockReturnValue({
      data: mockClusterScaleway,
      isLoading: false,
    } as unknown as ReturnType<typeof useCluster>)
    mockUseClusterRoutingTable.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useClusterRoutingTable>)

    renderWithProviders(
      wrapWithReactHookForm(<ClusterNetworkSettings organizationId="org-id" clusterId="cluster-id" />)
    )

    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should render configured network features for non-Scaleway cluster without existing VPC', () => {
    const clusterWithFeatures: Cluster = {
      ...mockCluster,
      features: [
        {
          id: 'VPC_PEERING',
          value_object: {
            value: true,
          },
        },
      ],
    } as Cluster

    mockUseCluster.mockReturnValue({
      data: clusterWithFeatures,
      isLoading: false,
    } as unknown as ReturnType<typeof useCluster>)
    mockUseClusterRoutingTable.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useClusterRoutingTable>)

    renderWithProviders(
      wrapWithReactHookForm(<ClusterNetworkSettings organizationId="org-id" clusterId="cluster-id" />)
    )

    expect(screen.getByText('Configured network features')).toBeInTheDocument()
  })

  it('should not render routes section when cluster has existing VPC', () => {
    const clusterWithExistingVpc: Cluster = {
      ...mockCluster,
      features: [
        {
          id: 'EXISTING_VPC',
          value_object: {
            type: 'AWS_USER_PROVIDED_NETWORK',
            value: {
              aws_vpc_eks_id: 'vpc-123',
            },
          },
        },
      ],
    } as Cluster

    mockUseCluster.mockReturnValue({
      data: clusterWithExistingVpc,
      isLoading: false,
    } as unknown as ReturnType<typeof useCluster>)
    mockUseClusterRoutingTable.mockReturnValue({
      data: mockRoutes,
      isLoading: false,
    } as unknown as ReturnType<typeof useClusterRoutingTable>)

    renderWithProviders(
      wrapWithReactHookForm(<ClusterNetworkSettings organizationId="org-id" clusterId="cluster-id" />)
    )

    expect(screen.queryByText('Routes')).not.toBeInTheDocument()
  })
})

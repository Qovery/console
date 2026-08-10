import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterCardSetup } from './cluster-card-setup'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

const mockUseCluster = useCluster as jest.Mock
const mockUseClusterRunningStatus = useClusterRunningStatus as jest.Mock

describe('ClusterCardSetup', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  const mockCluster = {
    created_at: '2024-05-01T12:00:00Z',
    cloud_provider: 'AWS',
    kubernetes: 'MANAGED',
    production: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCluster.mockReturnValue({
      data: mockCluster,
    })
  })

  it('should render Kubernetes up to date status', () => {
    const mockRunningStatus = {
      computed_status: {
        kube_version_status: {
          type: 'OK',
          kube_version: 'v1.28.1',
        },
      },
    }
    mockUseClusterRunningStatus.mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<ClusterCardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Kubernetes up to date')).toBeInTheDocument()
    expect(screen.getByText('v1.28.1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Maintenance every Monday/ })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/clusters#faq'
    )
  })

  it('should show Wednesday maintenance for production clusters', () => {
    mockUseCluster.mockReturnValue({
      data: { ...mockCluster, production: true },
    })
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          kube_version_status: {
            type: 'OK',
            kube_version: 'v1.28.1',
          },
        },
      },
    })

    renderWithProviders(<ClusterCardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByRole('link', { name: /Maintenance every Wednesday/ })).toBeInTheDocument()
  })

  it('should render upgrade Kubernetes status', () => {
    const mockRunningStatus = {
      computed_status: {
        kube_version_status: {
          type: 'DRIFT',
          kube_version: 'v1.26.0',
          expected_kube_version: 'v1.28.1',
        },
      },
    }
    mockUseClusterRunningStatus.mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<ClusterCardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Upgrade Kubernetes')).toBeInTheDocument()
    expect(screen.getByText('v1.26.0 → v1.28.1')).toBeInTheDocument()
  })

  it('should render plain Kubernetes version for EKS Anywhere drift status', () => {
    const mockRunningStatus = {
      computed_status: {
        kube_version_status: {
          type: 'DRIFT',
          kube_version: 'v1.34',
          expected_kube_version: 'v1.33',
        },
      },
    }
    mockUseCluster.mockReturnValue({
      data: {
        ...mockCluster,
        kubernetes: 'PARTIALLY_MANAGED',
      },
    })
    mockUseClusterRunningStatus.mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<ClusterCardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Kubernetes version')).toBeInTheDocument()
    expect(screen.getByText('v1.34')).toBeInTheDocument()
    expect(screen.queryByText('Upgrade Kubernetes')).not.toBeInTheDocument()
    expect(screen.queryByText('v1.34 → v1.33')).not.toBeInTheDocument()
  })

  it('should render unsupported Kubernetes version status', () => {
    const mockRunningStatus = {
      computed_status: {
        kube_version_status: {
          type: 'UNKNOWN',
        },
      },
    }
    mockUseClusterRunningStatus.mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<ClusterCardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Kubernetes version')).toBeInTheDocument()
    expect(screen.getByText('Unsupported')).toBeInTheDocument()
  })
})

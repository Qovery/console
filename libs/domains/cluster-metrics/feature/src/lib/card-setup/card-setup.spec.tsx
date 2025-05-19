import { useCluster, useClusterRunningStatus, useClusterStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CardSetup } from './card-setup'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterStatus: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

describe('CardSetup', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  const mockCluster = {
    created_at: '2024-05-01T12:00:00Z',
  }

  const mockDeploymentStatus = {
    is_deployed: true,
    last_deployment_date: '2024-05-15T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCluster as jest.Mock).mockReturnValue({
      data: mockCluster,
    })
    ;(useClusterStatus as jest.Mock).mockReturnValue({
      data: mockDeploymentStatus,
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
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<CardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Kubernetes up to date')).toBeInTheDocument()
    expect(screen.getByText('v1.28.1')).toBeInTheDocument()
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
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<CardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Upgrade Kubernetes')).toBeInTheDocument()
    expect(screen.getByText('v1.26.0 → v1.28.1')).toBeInTheDocument()
  })

  it('should render unsupported Kubernetes version status', () => {
    const mockRunningStatus = {
      computed_status: {
        kube_version_status: {
          type: 'UNKNOWN',
        },
      },
    }
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })

    renderWithProviders(<CardSetup organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Kubernetes version')).toBeInTheDocument()
    expect(screen.getByText('Unsupported')).toBeInTheDocument()
  })
})

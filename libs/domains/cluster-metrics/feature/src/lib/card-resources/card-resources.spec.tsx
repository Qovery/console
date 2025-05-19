import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { calculateClusterResources } from './calculate-cluster-resources'
import { CardResources } from './card-resources'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusterRunningStatus: jest.fn(),
}))

jest.mock('./calculate-cluster-resources', () => ({
  calculateClusterResources: jest.fn(),
}))

describe('CardResources', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  const mockClusterResources = {
    cpu: {
      used: 2.5,
      total: 8,
      percent: 31.25,
      unit: 'vCPU',
    },
    memory: {
      used: 4,
      total: 16,
      percent: 25,
      unit: 'GB',
    },
    disk: {
      used: 50,
      total: 200,
      percent: 26,
      unit: 'GB',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    const mockRunningStatus = {
      nodes: [],
    }

    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })
    ;(calculateClusterResources as jest.Mock).mockReturnValue(mockClusterResources)
  })

  it('should render the component with correct structure', () => {
    renderWithProviders(<CardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Total cluster resources')).toBeInTheDocument()
    expect(screen.getByText('CPU usage')).toBeInTheDocument()
    expect(screen.getByText('Memory usage')).toBeInTheDocument()
    expect(screen.getByText('Disk usage')).toBeInTheDocument()
  })

  it('should display the correct CPU resource values', () => {
    renderWithProviders(<CardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('2.5')).toBeInTheDocument()
    expect(screen.getByText(/\/8 vCPU/)).toBeInTheDocument()
    expect(screen.getByText('31.25%')).toBeInTheDocument()
  })

  it('should display the correct Memory resource values', () => {
    renderWithProviders(<CardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/\/16 GB/)).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should display the correct Disk resource values', () => {
    renderWithProviders(<CardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText(/\/200 GB/)).toBeInTheDocument()
    expect(screen.getByText('26%')).toBeInTheDocument()
  })
})

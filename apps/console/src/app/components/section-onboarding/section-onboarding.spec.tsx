import { ClusterStateEnum, type OrganizationOnboardingResponse } from 'qovery-typescript-axios'
import { useOnboardingCompletion } from '@qovery/domains/onboarding/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { SectionOnboarding } from './section-onboarding'

let mockOnboarding: OrganizationOnboardingResponse | undefined
let mockLoading = false
const mockUpdateOnboarding = jest.fn()
const mockClusters = jest.fn()
const mockClusterStatuses = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'new-org' }),
  useNavigate: () => jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}))
jest.mock('./use-organization-onboarding', () => ({
  useOrganizationOnboarding: () => ({ data: mockOnboarding, isLoading: mockLoading }),
  useUpdateOrganizationOnboarding: () => ({ mutate: mockUpdateOnboarding }),
}))
jest.mock('@qovery/domains/organizations/feature', () => ({
  useOrganization: () => ({ data: { id: 'new-org', name: 'Acme' } }),
}))
jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusters: (options: unknown) => mockClusters(options),
  useClusterStatuses: (options: unknown) => mockClusterStatuses(options),
  ClusterInstallationGuideModal: () => null,
}))
jest.mock('@qovery/domains/projects/feature', () => ({
  useProjects: () => ({ data: [{ id: 'main-project', name: 'main' }] }),
}))
jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironments: () => ({ data: [] }),
  useDeploymentRule: () => ({ data: undefined }),
  CreateCloneEnvironmentModal: () => null,
}))
jest.mock('@qovery/domains/services/feature', () => ({
  useServices: () => ({ data: [] }),
  useServiceStatuses: () => ({ data: undefined }),
}))
jest.mock('@qovery/domains/onboarding/feature', () => ({ useOnboardingCompletion: jest.fn() }))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: jest.fn() }),
}))
jest.mock('@qovery/shared/mcp-suggestion/feature', () => ({ McpSuggestionCard: () => null }))

describe('SectionOnboarding', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    mockOnboarding = { status: 'IN_PROGRESS' }
    mockLoading = false
    mockClusters.mockReturnValue({ data: [] })
    mockClusterStatuses.mockReturnValue({ data: [] })
    jest.mocked(useOnboardingCompletion).mockReturnValue({ hasEnvironment: false, isServiceDeployed: false })
  })
  afterEach(() => jest.useRealTimers())

  it.each([undefined, null, ''])('shows cluster setup cards without selected use cases (%s)', (useCases) => {
    mockOnboarding = { status: 'IN_PROGRESS', use_cases: useCases }
    renderWithProviders(<SectionOnboarding />)

    expect(screen.getByText('Create a new cluster (Qovery Managed)')).toBeInTheDocument()
    expect(screen.getByText('Bring your own cluster')).toBeInTheDocument()
    expect(screen.getByText('Local Machine')).toBeInTheDocument()
    expect(screen.getByText('Create my first environment')).toBeInTheDocument()
    expect(mockClusters).toHaveBeenCalledWith({ organizationId: 'new-org', enabled: true })
    expect(screen.queryByText('Turn on preview environment')).not.toBeInTheDocument()
  })

  it.each(['DISMISSED', 'COMPLETED'] as const)('keeps %s onboarding hidden', (status) => {
    mockOnboarding = { status }
    renderWithProviders(<SectionOnboarding />)
    expect(screen.queryByText('Bring your own cluster')).not.toBeInTheDocument()
    expect(mockClusters).toHaveBeenCalledWith({ organizationId: 'new-org', enabled: false })
  })

  it('does not display setup when onboarding data is unavailable', () => {
    mockOnboarding = undefined
    renderWithProviders(<SectionOnboarding />)
    expect(screen.queryByText('Bring your own cluster')).not.toBeInTheDocument()
  })

  it('preserves optional steps for existing use cases', () => {
    mockOnboarding = { status: 'IN_PROGRESS', use_cases: 'ephemeral-environments' }
    renderWithProviders(<SectionOnboarding />)
    expect(screen.getByText('Turn on preview environment')).toBeInTheDocument()
  })

  it('marks the standard setup complete without requiring use cases', async () => {
    mockClusterStatuses.mockReturnValue({
      data: [{ status: ClusterStateEnum.DEPLOYED, is_deployed: true }],
    })
    jest.mocked(useOnboardingCompletion).mockReturnValue({ hasEnvironment: true, isServiceDeployed: true })
    renderWithProviders(<SectionOnboarding />)
    await waitFor(() => expect(mockUpdateOnboarding).toHaveBeenCalledWith('COMPLETED'))
    expect(screen.queryByText('Bring your own cluster')).not.toBeInTheDocument()
  })
})

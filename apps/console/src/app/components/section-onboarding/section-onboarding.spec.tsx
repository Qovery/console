import { ClusterStateEnum, type OrganizationOnboardingResponse } from 'qovery-typescript-axios'
import { useOnboardingCompletion } from '@qovery/domains/onboarding/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { SectionOnboarding } from './section-onboarding'

let mockOnboarding: OrganizationOnboardingResponse | undefined
let mockLoading = false
const mockUpdateOnboarding = jest.fn()
const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockAlertClickOutside = jest.fn()
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
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
    enableAlertClickOutside: mockAlertClickOutside,
  }),
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
    jest
      .mocked(useOnboardingCompletion)
      .mockReturnValue({ hasEnvironment: false, isServiceDeployed: false, isLoading: false })
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

  it('silently completes an organization that is already set up', async () => {
    mockClusterStatuses.mockReturnValue({
      data: [{ status: ClusterStateEnum.DEPLOYED, is_deployed: true }],
    })
    jest
      .mocked(useOnboardingCompletion)
      .mockReturnValue({ hasEnvironment: true, isServiceDeployed: true, isLoading: false })
    renderWithProviders(<SectionOnboarding />)
    await waitFor(() => expect(mockUpdateOnboarding).toHaveBeenCalledWith('COMPLETED'))
    expect(mockOpenModal).not.toHaveBeenCalled()
    expect(screen.queryByText('Bring your own cluster')).not.toBeInTheDocument()
  })
  it('waits for setup data before deciding whether to celebrate', async () => {
    mockClusterStatuses.mockReturnValue({ data: [], isPending: true })
    jest
      .mocked(useOnboardingCompletion)
      .mockReturnValue({ hasEnvironment: false, isServiceDeployed: false, isLoading: true })
    const { rerender } = renderWithProviders(<SectionOnboarding />, { wrapper: ({ children }) => children })
    expect(mockUpdateOnboarding).not.toHaveBeenCalled()

    mockClusterStatuses.mockReturnValue({
      data: [{ status: ClusterStateEnum.DEPLOYED, is_deployed: true }],
      isPending: false,
    })
    jest
      .mocked(useOnboardingCompletion)
      .mockReturnValue({ hasEnvironment: true, isServiceDeployed: true, isLoading: false })
    rerender(<SectionOnboarding />)
    await waitFor(() => expect(mockUpdateOnboarding).toHaveBeenCalledWith('COMPLETED'))
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  it('celebrates when an incomplete setup finishes during the session', async () => {
    const { rerender } = renderWithProviders(<SectionOnboarding />, { wrapper: ({ children }) => children })
    mockClusterStatuses.mockReturnValue({
      data: [{ status: ClusterStateEnum.DEPLOYED, is_deployed: true }],
      isPending: false,
    })
    jest
      .mocked(useOnboardingCompletion)
      .mockReturnValue({ hasEnvironment: true, isServiceDeployed: true, isLoading: false })
    rerender(<SectionOnboarding />)
    await waitFor(() => expect(mockOpenModal).toHaveBeenCalledTimes(1))
    expect(mockUpdateOnboarding).toHaveBeenCalledWith('COMPLETED')
    rerender(<SectionOnboarding />)
    expect(mockOpenModal).toHaveBeenCalledTimes(1)
  })
})

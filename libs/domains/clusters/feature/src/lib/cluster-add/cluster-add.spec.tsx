import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type SelfManagedClusterCreationFlowProps } from '../self-managed-cluster-creation/self-managed-cluster-creation-flow'
import { ClusterAdd } from './cluster-add'

const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123' }),
    useNavigate: () => mockNavigate,
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})
jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { capture: jest.fn() },
}))
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: () => false }))
const mockShowPylonForm = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm }),
}))
jest.mock('../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction', () => ({
  useClusterCreationRestriction: () => ({ isClusterCreationRestricted: false }),
}))
jest.mock('../self-managed-cluster-creation/self-managed-cluster-creation-flow', () => ({
  ...jest.requireActual('../self-managed-cluster-creation/self-managed-cluster-creation-flow'),
  SelfManagedClusterCreationFlow: ({ cloudProvider, onStepChange, onClose }: SelfManagedClusterCreationFlowProps) => (
    <div>
      <p>Creation flow</p>
      <p>Provider {cloudProvider}</p>
      <button type="button" onClick={() => onStepChange?.('install')}>
        Reach install step
      </button>
      <button type="button" onClick={onClose}>
        Operator connected
      </button>
    </div>
  ),
}))

describe('ClusterAdd', () => {
  beforeEach(() => mockNavigate.mockClear())
  afterEach(() => jest.restoreAllMocks())

  async function openCreationFlow(userEvent: ReturnType<typeof renderWithProviders>['userEvent']) {
    await userEvent.click(screen.getByRole('button', { name: 'AWS' }))
    expect(await screen.findByText('Creation flow')).toBeInTheDocument()
  }

  it('asks for EKS Anywhere access when it is not enabled', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await userEvent.click(screen.getByRole('button', { name: /Amazon Web Services EKS Anywhere\s*Request access/ }))

    expect(mockShowPylonForm).toHaveBeenCalledWith('request-access-eks-anywhere')
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AWS',
      selectedInstallationType: 'partially-managed',
    })
  })

  it('keeps the local demo available by default', () => {
    renderWithProviders(<ClusterAdd />)
    expect(screen.getByRole('button', { name: 'Local machine (Demo)' })).toBeInTheDocument()
  })

  it('names each provider card once for assistive technologies', () => {
    const { container } = renderWithProviders(<ClusterAdd />)

    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument()
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(container.querySelectorAll('svg:not([aria-hidden="true"])')).toHaveLength(0)
  })

  it.each([
    ['AWS', 'AWS'],
    ['GCP', 'GCP'],
    ['Scaleway', 'SCW'],
  ])('opens the creation flow on %s for a cluster to connect', async (title, provider) => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await userEvent.click(screen.getByRole('button', { name: title }))

    expect(await screen.findByText(`Provider ${provider}`)).toBeInTheDocument()
    // The BYOC modal wrapper must not enable Radix's document-level scroll lock.
    expect(document.body).not.toHaveAttribute('data-scroll-locked')
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: provider,
      selectedInstallationType: 'self-managed',
    })
  })

  it('lets the creation flow be dismissed before the cluster is created', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AWS',
      selectedInstallationType: 'self-managed',
    })
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it.each([
    [
      'Escape',
      async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
        await userEvent.keyboard('{Escape}')
      },
    ],
    [
      'its button',
      async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
        await userEvent.click(screen.getByRole('button', { name: 'Close' }))
      },
    ],
  ])('opens the clusters list when closed with %s once the cluster is created', async (_, close) => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))
    await close(userEvent)

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/clusters',
      params: { organizationId: 'org-123' },
    })
  })

  it('leaves the redirection to the flow once the Operator connects', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))
    await userEvent.click(screen.getByRole('button', { name: 'Operator connected' }))

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

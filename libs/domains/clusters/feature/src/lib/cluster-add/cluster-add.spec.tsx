import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
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
let mockEnabledFeatureFlags: string[] = []
jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: (flag: string) => mockEnabledFeatureFlags.includes(flag),
}))
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

const getExistingClusterCardTitles = () => {
  const heading = screen.getByRole('heading', { name: 'Connect existing cluster (BYOK)' })
  const section = heading.closest('section') as HTMLElement
  return within(section)
    .getAllByRole('button')
    .map((card) => card.textContent)
}

describe('ClusterAdd', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockEnabledFeatureFlags = []
  })
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

  describe.each([
    ['off', []],
    ['on', ['byok-v2-on-premise']],
  ])('with the byok-v2-on-premise flag %s', (_, enabledFeatureFlags) => {
    beforeEach(() => {
      mockEnabledFeatureFlags = enabledFeatureFlags
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

    it.each([
      ['Microsoft Azure', 'AZURE'],
      ['Digital Ocean', 'DIGITAL_OCEAN'],
    ])('keeps the installation guide on %s', async (title, provider) => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await userEvent.click(screen.getByRole('button', { name: title }))

      expect(await screen.findByRole('heading', { name: 'Install Qovery on your cluster' })).toBeInTheDocument()
      expect(screen.queryByText('Creation flow')).not.toBeInTheDocument()
      expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
        selectedCloudProvider: provider,
        selectedInstallationType: 'self-managed',
      })
    })
  })

  describe('with the byok-v2-on-premise flag off', () => {
    it('lists the same clusters to connect as before', () => {
      renderWithProviders(<ClusterAdd />)

      expect(getExistingClusterCardTitles()).toEqual([
        'Local machine (Demo)',
        'AWS',
        'GCP',
        'Scaleway',
        'Microsoft Azure',
        'OVH Cloud',
        'Digital Ocean',
        'CIVO',
        'Oracle Cloud Infrastructure',
        'Hetzner',
        'IBM Cloud',
      ])
    })

    it.each([
      ['OVH Cloud', 'OVH_CLOUD'],
      ['CIVO', 'CIVO'],
      ['Oracle Cloud Infrastructure', 'ORACLE_CLOUD'],
      ['Hetzner', 'HETZNER'],
      ['IBM Cloud', 'IBM_CLOUD'],
    ])('opens the installation guide on %s', async (title, provider) => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await userEvent.click(screen.getByRole('button', { name: title }))

      expect(await screen.findByRole('heading', { name: 'Install Qovery on your cluster' })).toBeInTheDocument()
      expect(screen.queryByText('Creation flow')).not.toBeInTheDocument()
      expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
        selectedCloudProvider: provider,
        selectedInstallationType: 'self-managed',
      })
    })
  })

  describe('with the byok-v2-on-premise flag on', () => {
    beforeEach(() => {
      mockEnabledFeatureFlags = ['byok-v2-on-premise']
    })

    it('adds a card for any other Kubernetes cluster', () => {
      renderWithProviders(<ClusterAdd />)

      expect(getExistingClusterCardTitles()).toEqual([
        'Local machine (Demo)',
        'AWS',
        'GCP',
        'Scaleway',
        'Microsoft Azure',
        'OVH Cloud',
        'Digital Ocean',
        'CIVO',
        'Oracle Cloud Infrastructure',
        'Hetzner',
        'IBM Cloud',
        'Other Kubernetes',
      ])
    })

    it.each([
      ['OVH Cloud', 'OVH', 'OVH_CLOUD'],
      ['CIVO', 'CIVO', 'CIVO'],
      ['Oracle Cloud Infrastructure', 'ORACLE', 'ORACLE_CLOUD'],
      ['Hetzner', 'HETZNER', 'HETZNER'],
      ['IBM Cloud', 'IBM', 'IBM_CLOUD'],
      ['Other Kubernetes', 'ON_PREMISE', 'OTHER'],
    ])('opens the creation flow on %s with the provider %s', async (title, provider, analyticsProvider) => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await userEvent.click(screen.getByRole('button', { name: title }))

      expect(await screen.findByText(`Provider ${provider}`)).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Install Qovery on your cluster' })).not.toBeInTheDocument()
      expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
        selectedCloudProvider: analyticsProvider,
        selectedInstallationType: 'self-managed',
      })
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

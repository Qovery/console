import axios from 'axios'
import posthog from 'posthog-js'
import type { Gate } from 'qovery-pricing-typescript-axios'
import { createAxiosFetchAdapter, renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
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
const mockBillingFlag = jest.fn(() => false)
let mockEnabledFeatureFlags: string[] = []
jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: (flag: string) =>
    flag === 'billing-paywall' ? mockBillingFlag() : mockEnabledFeatureFlags.includes(flag),
}))
const mockShowPylonForm = jest.fn()
const mockShowChat = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm, showChat: mockShowChat }),
}))
// The gates pricing-api answers (the billing-paywall flag on): none by default, nothing locked.
const mockGates: { current: Gate[] | undefined } = { current: undefined }
const mockGatesCall = jest.fn()
const originalAdapter = axios.defaults.adapter
const mockGateIntro = jest.fn()

const lockedManaged: Gate = {
  action: 'cluster.create',
  sku: 'clusters.managed',
  name: 'Managed clusters',
  allowed: false,
  reason: 'not_in_plan',
  limit: 0,
  used: 0,
  requested: 1,
  paywall: {
    sku: 'clusters.managed',
    title: 'Qovery-managed clusters',
    message: 'Your Free plan includes 0 clusters.',
    headline: 'Let Qovery run your Kubernetes cluster',
    benefits: ['Qovery creates the cluster in your cloud account and keeps it upgraded and patched.'],
    audience: 'billing',
    options: [
      { type: 'start_trial', label: 'Try it free for 14 days', days: 14, includes: '1 more Qovery-managed cluster' },
      { type: 'contact_sales', label: 'Talk to us' },
    ],
  },
}
const lockedSelfManaged: Gate = {
  action: 'cluster.create_self_managed',
  sku: 'clusters.self_managed',
  name: 'Self-managed clusters',
  allowed: false,
  reason: 'limit_reached',
  limit: 1,
  used: 1,
  requested: 1,
  paywall: {
    sku: 'clusters.self_managed',
    title: 'Self-managed clusters',
    message: 'Your Free plan includes 1 self-managed cluster and you are using 1.',
    headline: 'Connect a Kubernetes cluster you already run',
    benefits: [],
    audience: 'billing',
    options: [
      { type: 'upgrade', label: 'Upgrade to Starter', plan: 'STARTER_2026', plan_name: 'Starter' },
      { type: 'contact_sales', label: 'Talk to us' },
    ],
  },
}
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
    mockGates.current = undefined
    mockBillingFlag.mockReturnValue(false)
    mockGateIntro.mockClear()
    mockGatesCall.mockClear()
    axios.defaults.adapter = createAxiosFetchAdapter(async (input, init) => {
      const url = new URL(String(input))
      if (url.pathname.endsWith('/gates')) {
        mockGatesCall(Object.fromEntries(url.searchParams))
        return { ok: true, status: 200, json: async () => ({ gates: mockGates.current ?? [] }) } as Response
      }
      if (url.pathname.endsWith('/gates/intro')) {
        mockGateIntro(url.pathname.split('/')[2], JSON.parse(String(init?.body)))
      }
      return { ok: true, status: 204 } as Response
    })
  })
  afterEach(() => {
    axios.defaults.adapter = originalAdapter
    jest.restoreAllMocks()
  })

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

  it('keeps the managed card unlocked and skips gates with billing disabled', () => {
    mockGates.current = [lockedManaged]
    renderWithProviders(<ClusterAdd />)
    expect(screen.getByText('Amazon Web Services').closest('a')).toBeInTheDocument()
    expect(mockGatesCall).not.toHaveBeenCalled()
  })

  describe('when the plan does not include Qovery-managed clusters', () => {
    beforeEach(() => {
      mockBillingFlag.mockReturnValue(true)
      mockGates.current = [lockedManaged]
    })

    it('shows the managed cards locked with the trial, and opens the full-page paywall instead of the creation flow', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      const aws = await screen.findByRole('button', { name: /^Amazon Web Services\s*Try it free for 14 days$/ })
      expect(screen.getAllByText('Try it free for 14 days')).toHaveLength(4)
      expect(screen.getByText('Google Cloud Platform').closest('a')).not.toBeInTheDocument()

      await userEvent.click(aws)

      expect(await screen.findByText('Let Qovery run your Kubernetes cluster')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Qovery-managed clusters' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Start a 14-day trial' })).toBeInTheDocument()
      expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
        selectedCloudProvider: 'AWS',
        selectedInstallationType: 'managed',
      })
    })

    it('keeps self-managed clusters available', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)
      await screen.findAllByText('Try it free for 14 days')

      await userEvent.click(screen.getByRole('button', { name: 'GCP' }))

      expect(await screen.findByText('Provider GCP')).toBeInTheDocument()
    })

    it('opens the sales chat from the paywall', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)
      await userEvent.click(await screen.findByRole('button', { name: /^Microsoft Azure\s*Try it free/ }))

      await userEvent.click(await screen.findByRole('button', { name: 'Talk to us' }))

      expect(mockShowChat).toHaveBeenCalled()
    })
  })

  describe('when the plan has no self-managed cluster left', () => {
    beforeEach(() => {
      mockBillingFlag.mockReturnValue(true)
      mockGates.current = [lockedSelfManaged]
    })

    it('locks the self-managed cards and opens the full-page paywall instead of the creation flow', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      const gcp = await screen.findByRole('button', { name: /^GCP\s*Starter plan$/ })
      await userEvent.click(gcp)

      expect(await screen.findByRole('heading', { level: 1, name: 'Self-managed clusters' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upgrade to Starter' })).toBeInTheDocument()
      expect(screen.queryByText('Creation flow')).not.toBeInTheDocument()
    })

    it('locks the demo cluster too, and keeps the managed cards as links', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await userEvent.click(await screen.findByRole('button', { name: /^Local machine \(Demo\)\s*Starter plan$/ }))

      expect(await screen.findByRole('heading', { level: 1, name: 'Self-managed clusters' })).toBeInTheDocument()
      expect(screen.getByText('Amazon Web Services').closest('a')).toBeInTheDocument()
    })
  })

  describe('when the plan includes them and their intro is due for this person', () => {
    const intro = (sku: string, title: string) => ({
      sku,
      title,
      headline: 'Included in your plan',
      benefits: [],
      plan: { code: 'GROWTH_2026', name: 'Growth' },
      cta: 'Continue',
    })
    beforeEach(() => {
      mockBillingFlag.mockReturnValue(true)
      mockGates.current = [
        {
          ...lockedManaged,
          allowed: true,
          reason: '',
          paywall: undefined,
          intro: intro('clusters.managed', 'Qovery-managed clusters'),
        },
        {
          ...lockedSelfManaged,
          allowed: true,
          reason: '',
          paywall: undefined,
          intro: intro('clusters.self_managed', 'Self-managed clusters'),
        },
      ]
    })

    it('shows the intro before the managed creation, and Continue goes on to it', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)
      await screen.findByRole('button', { name: 'Amazon Web Services' })
      expect(screen.queryByText('Try it free for 14 days')).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Amazon Web Services' }))

      expect(await screen.findByText('Included in your Growth plan')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/cluster/create/$slug',
        params: { organizationId: 'org-123', slug: 'aws' },
      })
      expect(mockGateIntro).toHaveBeenCalledWith('org-123', { sku: 'clusters.managed', action: 'shown' })
      expect(mockGateIntro).toHaveBeenCalledWith('org-123', { sku: 'clusters.managed', action: 'continued' })
    })

    it('shows the intro before the self-managed flow, then opens it', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)
      await userEvent.click(await screen.findByRole('button', { name: 'GCP' }))

      expect(await screen.findByRole('heading', { level: 1, name: 'Self-managed clusters' })).toBeInTheDocument()
      expect(screen.queryByText('Provider GCP')).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
      expect(await screen.findByText('Provider GCP')).toBeInTheDocument()
      expect(mockGateIntro).toHaveBeenCalledWith('org-123', { sku: 'clusters.self_managed', action: 'shown' })
      expect(mockGateIntro).toHaveBeenCalledWith('org-123', { sku: 'clusters.self_managed', action: 'continued' })
    })
  })

  it('keeps the managed cards as links when nothing is locked', () => {
    renderWithProviders(<ClusterAdd />)
    expect(screen.getByText('Amazon Web Services').closest('a')).toBeInTheDocument()
    expect(screen.queryByText('Try it free for 14 days')).not.toBeInTheDocument()
  })
})

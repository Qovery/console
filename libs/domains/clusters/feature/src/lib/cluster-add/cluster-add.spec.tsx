import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type SelfManagedClusterCreationFlowProps } from '../self-managed-cluster-creation/self-managed-cluster-creation-flow'
import { ClusterAdd } from './cluster-add'

const mockUseBlocker = jest.fn()
jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123' }),
    useBlocker: (options: unknown) => mockUseBlocker(options),
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
  SelfManagedClusterCreationFlow: ({ onStepChange, onClose }: SelfManagedClusterCreationFlowProps) => (
    <div>
      <p>Creation flow</p>
      <button type="button" onClick={() => onStepChange?.('install')}>
        Reach install step
      </button>
      <button type="button" onClick={onClose}>
        Operator connected
      </button>
    </div>
  ),
}))

type BlockerOptions = { disabled: boolean; shouldBlockFn: () => boolean; enableBeforeUnload: boolean }
const getBlocker = () => mockUseBlocker.mock.calls.at(-1)?.[0] as BlockerOptions

describe('ClusterAdd', () => {
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

  it('names each provider card once for assistive technologies', () => {
    const { container } = renderWithProviders(<ClusterAdd />)

    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument()
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(container.querySelectorAll('svg:not([aria-hidden="true"])')).toHaveLength(0)
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
  })

  it('cannot be dismissed on the install step, only closed by the flow once the Operator connects', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))
    await userEvent.keyboard('{Escape}')

    expect(screen.getByText('Creation flow')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Operator connected' }))

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
  })

  describe('leaving the install step', () => {
    it('does not guard the page before the cluster is created', async () => {
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      expect(getBlocker().disabled).toBe(true)

      await openCreationFlow(userEvent)

      expect(getBlocker().disabled).toBe(true)
    })

    it('asks for confirmation before leaving, and warns before the page unloads', async () => {
      const confirm = jest.spyOn(window, 'confirm')
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await openCreationFlow(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))

      expect(getBlocker()).toMatchObject({ disabled: false, enableBeforeUnload: true })
      confirm.mockReturnValueOnce(false)
      expect(getBlocker().shouldBlockFn()).toBe(true)
      confirm.mockReturnValueOnce(true)
      expect(getBlocker().shouldBlockFn()).toBe(false)
    })

    it('lets the flow navigate away once the Operator connects', async () => {
      const confirm = jest.spyOn(window, 'confirm')
      const { userEvent } = renderWithProviders(<ClusterAdd />)

      await openCreationFlow(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))
      await userEvent.click(screen.getByRole('button', { name: 'Operator connected' }))

      expect(getBlocker().shouldBlockFn()).toBe(false)
      expect(getBlocker().disabled).toBe(true)
      expect(confirm).not.toHaveBeenCalled()
    })
  })
})

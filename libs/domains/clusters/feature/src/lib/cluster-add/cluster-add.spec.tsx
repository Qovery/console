import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type SelfManagedClusterCreationFlowProps } from '../self-managed-cluster-creation/self-managed-cluster-creation-flow'
import { ClusterAdd } from './cluster-add'

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123' }),
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

describe('ClusterAdd', () => {
  async function openCreationFlow(userEvent: ReturnType<typeof renderWithProviders>['userEvent']) {
    await userEvent.click(screen.getByRole('button', { name: 'AWS' }))
    expect(await screen.findByText('Creation flow')).toBeInTheDocument()
  }

  it('lets the creation flow be dismissed before the cluster is created', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    expect(posthog.capture).toHaveBeenCalledWith('select-cluster', {
      selectedCloudProvider: 'AWS',
      selectedInstallationType: 'self-managed',
    })
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
  })

  it('cannot be dismissed on the install step, only closed by the flow once the Operator connects', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdd />)

    await openCreationFlow(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Reach install step' }))
    await userEvent.keyboard('{Escape}')

    expect(screen.getByText('Creation flow')).toBeInTheDocument()
    expect(document.querySelector('.fa-xmark')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Operator connected' }))

    await waitFor(() => expect(screen.queryByText('Creation flow')).not.toBeInTheDocument())
  })
})

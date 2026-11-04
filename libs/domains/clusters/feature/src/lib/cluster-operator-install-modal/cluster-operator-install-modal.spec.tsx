import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useClusterOperatorBootstrap } from '../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'
import { ClusterOperatorInstallModal } from './cluster-operator-install-modal'

const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-123', clusterId: 'cluster-123' }),
  useNavigate: () => mockNavigate,
}))
jest.mock('../hooks/use-cluster-operator-status/use-cluster-operator-status')
jest.mock('../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap')
const mockDownload = jest.fn()
jest.mock(
  'downloadjs',
  () =>
    (...args: unknown[]) =>
      mockDownload(...args)
)

const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock
const mockUseClusterOperatorBootstrap = useClusterOperatorBootstrap as jest.Mock

const neverConnectedStatus = { operator_connected: false, last_heartbeat: null, status: 'DISCONNECTED' }

describe('ClusterOperatorInstallModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClusterOperatorStatus.mockReturnValue({ data: neverConnectedStatus, isLoading: false })
    mockUseClusterOperatorBootstrap.mockReturnValue({
      data: { values_yaml: 'secret: values', helm_command: 'helm upgrade --install qovery-operator' },
      isLoading: false,
      isError: false,
    })
  })

  it('gives the installation instructions while the Operator has never connected', async () => {
    const { userEvent } = renderWithProviders(<ClusterOperatorInstallModal />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Install Qovery Operator' })).toBeInTheDocument()
    expect(screen.getByText(/it opens again with this cluster until the Operator connects/)).toBeInTheDocument()
    expect(screen.getByText('helm upgrade --install qovery-operator')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'documentation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'contact support' })).toBeInTheDocument()
    expect(mockUseClusterOperatorStatus).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
      refetchInterval: 30_000,
      stopPollingWhenMissing: true,
      stopPollingOnceInstalled: true,
    })
    expect(mockUseClusterOperatorBootstrap).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Download values.yaml' }))

    expect(mockDownload).toHaveBeenCalledWith('secret: values', 'values.yaml', 'text/yaml')
  })

  it.each([
    ['the status is loading', { data: undefined, isLoading: true }],
    ['the cluster has no Operator', { data: null, isLoading: false }],
    [
      'the Operator has already connected once',
      { data: { ...neverConnectedStatus, last_heartbeat: '2026-11-01T10:00:00Z' }, isLoading: false },
    ],
  ])('stays closed when %s', (_, operatorStatusQuery) => {
    mockUseClusterOperatorStatus.mockReturnValue(operatorStatusQuery)
    renderWithProviders(<ClusterOperatorInstallModal />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockUseClusterOperatorBootstrap).not.toHaveBeenCalled()
  })

  it.each([
    [
      'its button',
      async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
        await userEvent.click(screen.getByRole('button', { name: 'Close' }))
      },
    ],
    [
      'Escape',
      async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
        await userEvent.keyboard('{Escape}')
      },
    ],
    [
      'an outside click',
      async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
        await userEvent.click(screen.getByTestId('overlay'))
      },
    ],
  ])('opens the clusters list when closed with %s', async (_, close) => {
    const { userEvent } = renderWithProviders(<ClusterOperatorInstallModal />)

    await close(userEvent)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/clusters',
      params: { organizationId: 'org-123' },
    })
  })

  it('closes itself and keeps the user on the cluster once the Operator connects', async () => {
    const { rerender } = renderWithProviders(<ClusterOperatorInstallModal />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    mockUseClusterOperatorStatus.mockReturnValue({
      data: { operator_connected: true, last_heartbeat: '2026-11-04T10:00:00Z', status: 'CURRENT' },
      isLoading: false,
    })
    rerender(<ClusterOperatorInstallModal />)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('tells non-administrators they cannot get the instructions, without offering a retry', () => {
    mockUseClusterOperatorBootstrap.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 403 } },
    })
    renderWithProviders(<ClusterOperatorInstallModal />)

    expect(screen.getByText('Only cluster administrators can get the installation instructions.')).toBeInTheDocument()
    expect(screen.queryByText('The installation instructions could not be generated.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('announces the loading of the instructions', () => {
    mockUseClusterOperatorBootstrap.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    renderWithProviders(<ClusterOperatorInstallModal />)

    expect(screen.getByRole('status', { name: 'Loading installation instructions' })).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ConnectArgoCdModal } from './connect-argocd-modal'

const mockUseClusters = jest.fn()

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusters: () => mockUseClusters(),
}))

describe('ConnectArgoCdModal', () => {
  beforeEach(() => {
    mockUseClusters.mockReturnValue({
      data: [{ id: 'cluster-1', name: 'Cluster one' }],
      isLoading: false,
    })
  })

  it('should render modal content', () => {
    renderWithProviders(<ConnectArgoCdModal organizationId="org-id" onClose={jest.fn()} />)

    expect(screen.getByText('Connect ArgoCD with Qovery')).toBeInTheDocument()
    expect(screen.getByText('1. Select the cluster hosting your ArgoCD instance')).toBeInTheDocument()
    expect(screen.getByText('2. ArgoCD API endpoint')).toBeInTheDocument()
    expect(screen.getByText('3. Generate an access token')).toBeInTheDocument()
    expect(screen.getByText('$ argocd account generate-token')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect ArgoCD' })).toBeDisabled()
  })

  it('should render edit mode labels', () => {
    renderWithProviders(
      <ConnectArgoCdModal
        organizationId="org-id"
        onClose={jest.fn()}
        isEdit
        disableTargetClusterSelection
        initialValues={{
          targetCluster: 'cluster-1',
          argoCdApiUrl: 'https://argocd.example.com/api',
          accessToken: 'fake-token',
        }}
      />
    )

    expect(screen.getByText('Edit ArgoCD connection')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update connection' })).toBeInTheDocument()
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { LinkQoveryClusterModal } from './link-qovery-cluster-modal'

const mockUseClusters = jest.fn()

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusters: () => mockUseClusters(),
}))

describe('LinkQoveryClusterModal', () => {
  beforeEach(() => {
    mockUseClusters.mockReturnValue({
      data: [{ id: 'cluster-1', name: 'Cluster one' }],
      isLoading: false,
    })
  })

  it('should render modal content', () => {
    renderWithProviders(
      <LinkQoveryClusterModal
        organizationId="org-id"
        argoCdClusterName="kube-node-lease"
        servicesDetected={88}
        environmentsDetected={33}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText('Link to Qovery cluster')).toBeInTheDocument()
    expect(screen.getByText(/kube-node-lease/)).toBeInTheDocument()
    expect(screen.getByText(/88 detected services/)).toBeInTheDocument()
    expect(screen.getByText(/33 environments/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link cluster' })).toBeDisabled()
  })
})

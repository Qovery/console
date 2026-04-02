import { act } from 'react'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsArgoCdIntegration } from './settings-argocd-integration'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-id' }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
}))

describe('SettingsArgoCdIntegration', () => {
  beforeEach(() => {
    mockOpenModal.mockReset()
    mockCloseModal.mockReset()
    jest.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should render the empty state', () => {
    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('Argo CD integration')).toBeInTheDocument()
    expect(screen.getAllByText('Add ArgoCD')).toHaveLength(2)
    expect(screen.getByText('No ArgoCD integration configured')).toBeInTheDocument()
    expect(
      screen.getByText('Add your first ArgoCD instance to automatically visualize them in Qovery.')
    ).toBeInTheDocument()
  })

  it('should open the connect modal from both add buttons', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration />)

    const addButtons = screen.getAllByRole('button', { name: 'Add ArgoCD' })
    await userEvent.click(addButtons[0])
    await userEvent.click(addButtons[1])

    expect(mockOpenModal).toHaveBeenCalledTimes(2)
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          width: 676,
        }),
      })
    )
  })

  it('should switch to loading integration state and disable actions while importing', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration />)
    const addButton = screen.getAllByRole('button', { name: 'Add ArgoCD' })[0]
    await userEvent.click(addButton)

    const modalConfig = mockOpenModal.mock.calls[0][0]
    act(() => {
      modalConfig.content.props.onClose({
        clusterId: 'cluster-id',
        clusterName: 'undeletable_cluster',
        clusterCloudProvider: 'AWS',
      })
    })

    expect(mockCloseModal).toHaveBeenCalled()
    expect(screen.getByText('ArgoCD running on')).toBeInTheDocument()
    expect(screen.getByText('Detecting all namespaces and services')).toBeInTheDocument()
    expect(screen.getByTestId('edit-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('delete-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('argocd-cluster-link')).toHaveTextContent('undeletable_cluster')
  })

  it('should render loading integration use case when forced by prop', () => {
    renderWithProviders(<SettingsArgoCdIntegration useCaseId="loading-integration" />)

    expect(screen.getByText('ArgoCD running on')).toBeInTheDocument()
    expect(screen.getByText('Detecting all namespaces and services')).toBeInTheDocument()
    expect(screen.getByTestId('edit-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('delete-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('argocd-cluster-link')).toHaveTextContent('undeletable_cluster')
  })

  it('should render loaded integration use case when forced by prop', () => {
    renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    expect(screen.getByText('Linked clusters (3)')).toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (2)')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByTestId('edit-argocd-integration')).not.toBeDisabled()
    expect(screen.getByTestId('delete-argocd-integration')).not.toBeDisabled()
  })

  it('should render loaded single cluster use case when forced by prop', () => {
    renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded-single-cluster" />)

    expect(screen.queryByText('Linked clusters (3)')).not.toBeInTheDocument()
    expect(screen.queryByText('Unlinked clusters (2)')).not.toBeInTheDocument()
    expect(screen.getByText('AWS EKS Demo')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByTestId('open-associated-services-linked-aws')).toBeInTheDocument()
    expect(screen.queryByTestId('link-unlinked-cluster-unlinked-kube-node')).not.toBeInTheDocument()
  })

  it('should open associated services modal when clicking the layer button', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByText('Linked clusters (3)'))
    await userEvent.click(screen.getByTestId('open-associated-services-linked-aws'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.anything(),
      })
    )

    const modalConfig = mockOpenModal.mock.calls[0][0]
    expect(modalConfig.content.props.clusterName).toBe('AWS EKS Demo')
    expect(modalConfig.content.props.associatedItemsCount).toBe(4)
  })

  it('should move an unlinked cluster to linked clusters when link modal is confirmed', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByText('Unlinked clusters (2)'))
    await userEvent.click(screen.getByTestId('link-unlinked-cluster-unlinked-kube-node'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          width: 488,
        }),
      })
    )

    const modalConfig = mockOpenModal.mock.calls[0][0]
    act(() => {
      modalConfig.content.props.onClose({
        clusterId: 'cluster-42',
        clusterName: 'Qovery linked cluster',
        clusterCloudProvider: 'AWS',
        clusterType: 'Qovery managed',
      })
    })

    expect(mockCloseModal).toHaveBeenCalled()
    expect(screen.getByText('Linked clusters (4)')).toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (1)')).toBeInTheDocument()
    expect(screen.queryByTestId('link-unlinked-cluster-unlinked-kube-node')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Linked clusters (4)'))
    expect(screen.getByText('Qovery linked cluster')).toBeInTheDocument()
    expect(screen.getByText('kube-node-lease')).toBeInTheDocument()
  })

  it('should move a linked cluster to unlinked clusters when unlink icon is clicked', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByText('Linked clusters (3)'))
    await userEvent.click(screen.getByTestId('unlink-linked-cluster-linked-aws'))

    expect(screen.getByText('Linked clusters (2)')).toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (3)')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Unlinked clusters (3)'))
    expect(screen.getByText('kube-system')).toBeInTheDocument()
  })

  it('should hide unlinked clusters section when all unlinked clusters are linked', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByText('Unlinked clusters (2)'))
    await userEvent.click(screen.getByTestId('link-unlinked-cluster-unlinked-kube-node'))
    let modalConfig = mockOpenModal.mock.calls.at(-1)?.[0]
    act(() => {
      modalConfig.content.props.onClose({
        clusterId: 'cluster-1',
        clusterName: 'Cluster One',
        clusterCloudProvider: 'AWS',
        clusterType: 'Qovery managed',
      })
    })

    await userEvent.click(screen.getByTestId('link-unlinked-cluster-unlinked-istio'))
    modalConfig = mockOpenModal.mock.calls.at(-1)?.[0]
    act(() => {
      modalConfig.content.props.onClose({
        clusterId: 'cluster-2',
        clusterName: 'Cluster Two',
        clusterCloudProvider: 'GCP',
        clusterType: 'Self managed',
      })
    })

    expect(screen.queryByText(/Unlinked clusters \(\d+\)/)).not.toBeInTheDocument()
    expect(screen.getByText('Linked clusters (5)')).toBeInTheDocument()
  })

  it('should hide linked clusters section when all linked clusters are unlinked', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByText('Linked clusters (3)'))
    await userEvent.click(screen.getByTestId('unlink-linked-cluster-linked-aws'))

    await userEvent.click(screen.getByTestId('unlink-linked-cluster-linked-gitlab'))

    await userEvent.click(screen.getByTestId('unlink-linked-cluster-linked-gcp'))

    expect(screen.queryByText(/Linked clusters \(\d+\)/)).not.toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (5)')).toBeInTheDocument()
  })

  it('should open delete modal and clear integration on confirm', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByTestId('delete-argocd-integration'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          width: 488,
        }),
      })
    )

    const modalConfig = mockOpenModal.mock.calls[0][0]
    act(() => {
      modalConfig.content.props.onSubmit()
    })

    expect(screen.getByText('No ArgoCD integration configured')).toBeInTheDocument()
  })

  it('should open edit connection modal with locked target cluster', async () => {
    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration useCaseId="loaded" />)

    await userEvent.click(screen.getByTestId('edit-argocd-integration'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          width: 676,
        }),
      })
    )

    const modalConfig = mockOpenModal.mock.calls[0][0]
    expect(modalConfig.content.props.isEdit).toBe(true)
    expect(modalConfig.content.props.disableTargetClusterSelection).toBe(true)
    expect(modalConfig.content.props.initialValues).toEqual({
      targetCluster: 'cluster-id',
      argoCdApiUrl: 'https://argocd.example.com/api',
      accessToken: 'fake-token',
    })
  })
})

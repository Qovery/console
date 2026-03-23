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
})

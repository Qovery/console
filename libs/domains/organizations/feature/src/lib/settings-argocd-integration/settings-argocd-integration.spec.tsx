import { useParams } from '@tanstack/react-router'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useOrganizationArgoCdIntegrations } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { SettingsArgoCdIntegration } from './settings-argocd-integration'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
}))
jest.mock('../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations', () => ({
  useOrganizationArgoCdIntegrations: jest.fn(),
}))
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

describe('SettingsArgoCdIntegration', () => {
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
  const useOrganizationArgoCdIntegrationsMock = useOrganizationArgoCdIntegrations as jest.MockedFunction<
    typeof useOrganizationArgoCdIntegrations
  >

  beforeEach(() => {
    useParamsMock.mockReturnValue({ organizationId: 'org-1' } as never)
    mockOpenModal.mockReset()
    mockCloseModal.mockReset()
  })

  it('should render an empty state when no integration is configured', () => {
    useOrganizationArgoCdIntegrationsMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('No ArgoCD integration configured')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add ArgoCD' })).toBeInTheDocument()
  })

  it('should render integration cards with linked and unlinked sections', () => {
    useOrganizationArgoCdIntegrationsMock.mockReturnValue({
      data: [
        {
          agent_cluster_id: 'cluster-1',
          agent_cluster_name: 'undeletable_cluster',
          agent_cluster_cloud_provider: 'AWS',
          credentials_id: 'integration-1',
          argocd_url: 'https://argocd.example.com',
          status: 'connected',
          last_checked_at: '2026-04-28T12:20:00.000Z',
          linked_clusters: [
            {
              argocd_cluster_url: 'https://kubernetes.default.svc',
              argocd_cluster_name: 'kube-system',
              qovery_cluster_id: 'cluster-1',
              qovery_cluster_name: 'AWS EKS Demo',
              qovery_cluster_cloud_provider: 'AWS',
              qovery_cluster_type: 'MANAGED',
              applications_count: 4,
            },
          ],
          unlinked_clusters: [
            {
              argocd_cluster_url: 'https://unmapped.example.com',
              argocd_cluster_name: 'external-prod',
              applications_count: 7,
            },
          ],
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('ArgoCD running on')).toBeInTheDocument()
    expect(screen.getByText('Linked clusters (1)')).toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (1)')).toBeInTheDocument()
    expect(screen.getByText('AWS EKS Demo')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('should render an importing state when the integration has no cluster mapping yet', () => {
    useOrganizationArgoCdIntegrationsMock.mockReturnValue({
      data: [
        {
          agent_cluster_id: 'cluster-1',
          agent_cluster_name: 'undeletable_cluster',
          agent_cluster_cloud_provider: 'AWS',
          credentials_id: 'integration-1',
          argocd_url: 'https://argocd.example.com',
          status: 'connected',
          last_checked_at: '2026-04-28T12:20:00.000Z',
          linked_clusters: [],
          unlinked_clusters: [],
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('Importing ArgoCD...')).toBeInTheDocument()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    expect(screen.getByTestId('edit-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('delete-argocd-integration')).toBeDisabled()
  })
})

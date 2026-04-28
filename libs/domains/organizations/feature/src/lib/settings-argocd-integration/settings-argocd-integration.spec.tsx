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
          id: 'integration-1',
          agentClusterId: 'cluster-1',
          agentClusterName: 'undeletable_cluster',
          agentClusterCloudProvider: 'AWS',
          argoCdUrl: 'https://argocd.example.com',
          status: 'connected',
          lastCheckedAt: '2026-04-28T12:20:00.000Z',
          linkedClusters: [
            {
              id: 'linked-1',
              destinationCluster: 'https://kubernetes.default.svc',
              clusterId: 'cluster-1',
              clusterName: 'AWS EKS Demo',
              cloudProvider: 'AWS',
              clusterType: 'Qovery managed',
              argocdName: 'kube-system',
              applicationsCount: 4,
            },
          ],
          unlinkedClusters: [
            {
              id: 'unlinked-1',
              destinationCluster: 'https://unmapped.example.com',
              clusterId: null,
              clusterName: null,
              cloudProvider: null,
              clusterType: null,
              argocdName: 'external-prod',
              applicationsCount: 7,
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
})

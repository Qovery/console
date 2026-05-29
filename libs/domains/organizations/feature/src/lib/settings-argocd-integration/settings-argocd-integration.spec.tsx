import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useOrganizationArgoCdIntegrations } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { SettingsArgoCdIntegration } from './settings-argocd-integration'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockUnlinkArgoCdDestinationClusterMapping = jest.fn()
const mockRefetchArgoCdIntegrations = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))
jest.mock('../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations', () => ({
  useOrganizationArgoCdIntegrations: jest.fn(),
}))
jest.mock(
  '../hooks/use-unlink-argocd-destination-cluster-mapping/use-unlink-argocd-destination-cluster-mapping',
  () => ({
    useUnlinkArgoCdDestinationClusterMapping: () => ({
      mutateAsync: mockUnlinkArgoCdDestinationClusterMapping,
    }),
  })
)
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
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
    mockOpenModalConfirmation.mockReset()
    mockUnlinkArgoCdDestinationClusterMapping.mockReset()
    mockRefetchArgoCdIntegrations.mockReset()
  })

  it('should render an empty state when no integration is configured', () => {
    useOrganizationArgoCdIntegrationsMock.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetchArgoCdIntegrations,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('No ArgoCD integration configured')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add ArgoCD' })).toHaveLength(2)
  })

  it('should render integration cards with linked and unlinked sections', async () => {
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
      refetch: mockRefetchArgoCdIntegrations,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('ArgoCD running on')).toBeInTheDocument()
    expect(screen.getByText('Linked clusters (1)')).toBeInTheDocument()
    expect(screen.getByText('Unlinked clusters (1)')).toBeInTheDocument()
    expect(screen.getByText('AWS EKS Demo')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('argocd-associated-services-cluster-1'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({
            organizationId: 'org-1',
            clusterId: 'cluster-1',
            associatedServicesCount: 4,
          }),
        }),
        options: {
          width: 680,
        },
      })
    )

    await userEvent.click(screen.getByText('Unlinked clusters (1)'))

    expect(
      screen.getByText(
        'Unlinked clusters are clusters detected by ArgoCD that are not yet associated with a cluster in Qovery. Add the cluster to Qovery, then link it here to display the applications running on it.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('external-prod')).toBeInTheDocument()
    expect(screen.getByText('unmapped.example.com')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('should open a confirmation modal before unlinking a linked cluster mapping', async () => {
    mockUnlinkArgoCdDestinationClusterMapping.mockResolvedValue({})
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
          unlinked_clusters: [],
        },
      ],
      isLoading: false,
      refetch: mockRefetchArgoCdIntegrations,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration />)

    await userEvent.click(screen.getByTestId('unlink-linked-cluster-https://kubernetes.default.svc'))

    expect(mockUnlinkArgoCdDestinationClusterMapping).not.toHaveBeenCalled()
    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unlink ArgoCD cluster',
        confirmationMethod: 'action',
        confirmationAction: 'unlink',
        placeholder: 'Enter "unlink"',
      })
    )

    await mockOpenModalConfirmation.mock.calls[0][0].action()

    expect(mockUnlinkArgoCdDestinationClusterMapping).toHaveBeenCalledWith({
      organizationId: 'org-1',
      agentClusterId: 'cluster-1',
      argocdClusterUrl: 'https://kubernetes.default.svc',
    })
  })

  it('should display a warning callout when deleting an ArgoCD integration', async () => {
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
          unlinked_clusters: [],
        },
      ],
      isLoading: false,
      refetch: mockRefetchArgoCdIntegrations,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    const { userEvent } = renderWithProviders(<SettingsArgoCdIntegration />)

    await userEvent.click(screen.getByTestId('delete-argocd-integration'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({
            title: 'Remove ArgoCD integration',
            warning:
              'Related ArgoCD services will no longer be displayed in Qovery. Environments containing only these services will be removed.',
          }),
        }),
      })
    )
  })

  it('should refetch integrations while importing an integration with no cluster mapping yet', () => {
    jest.useFakeTimers()
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
      refetch: mockRefetchArgoCdIntegrations,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('Importing ArgoCD…')).toBeInTheDocument()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    expect(screen.getByTestId('edit-argocd-integration')).toBeDisabled()
    expect(screen.getByTestId('delete-argocd-integration')).toBeDisabled()

    expect(mockRefetchArgoCdIntegrations).not.toHaveBeenCalled()
    jest.advanceTimersByTime(3000)
    expect(mockRefetchArgoCdIntegrations).toHaveBeenCalled()
    jest.useRealTimers()
  })
})

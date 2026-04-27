import { useParams } from '@tanstack/react-router'
import { useDeleteArgoCdCredentials } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useOrganizationArgoCdIntegrations } from '../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations'
import { SettingsArgoCdIntegration } from './settings-argocd-integration'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
}))
jest.mock('../hooks/use-organization-argocd-integrations/use-organization-argocd-integrations', () => ({
  useOrganizationArgoCdIntegrations: jest.fn(),
}))
jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useDeleteArgoCdCredentials: jest.fn(),
}))

describe('SettingsArgoCdIntegration', () => {
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
  const useOrganizationArgoCdIntegrationsMock = useOrganizationArgoCdIntegrations as jest.MockedFunction<
    typeof useOrganizationArgoCdIntegrations
  >
  const useDeleteArgoCdCredentialsMock = useDeleteArgoCdCredentials as jest.MockedFunction<
    typeof useDeleteArgoCdCredentials
  >

  beforeEach(() => {
    useParamsMock.mockReturnValue({ organizationId: 'org-1' } as never)
    useDeleteArgoCdCredentialsMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useDeleteArgoCdCredentials>)
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

  it('should render configured integrations', () => {
    useOrganizationArgoCdIntegrationsMock.mockReturnValue({
      data: [
        {
          id: 'integration-1',
          clusterId: 'cluster-1',
          clusterName: 'Cluster 1',
          clusterCloudProvider: 'AWS',
          argoCdUrl: 'https://argocd.example.com',
          lastCheckedAt: '2026-04-27T10:00:00.000Z',
          createdAt: '2026-04-26T10:00:00.000Z',
          updatedAt: '2026-04-27T10:00:00.000Z',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useOrganizationArgoCdIntegrations>)

    renderWithProviders(<SettingsArgoCdIntegration />)

    expect(screen.getByText('Configured integrations')).toBeInTheDocument()
    expect(screen.getByText('Cluster 1')).toBeInTheDocument()
    expect(screen.getByText('https://argocd.example.com')).toBeInTheDocument()
  })
})

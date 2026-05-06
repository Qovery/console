import { type ArgocdAppResponse, type Environment } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ArgoCdServiceList } from './argocd-service-list'

const mockNavigate = jest.fn()
const mockUseArgoCdServices = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../hooks/use-argocd-services/use-argocd-services', () => ({
  useArgoCdServices: (params: unknown) => mockUseArgoCdServices(params),
}))

const environment = {
  id: 'env-1',
  name: 'Environment',
  organization: {
    id: 'org-1',
  },
  project: {
    id: 'project-1',
  },
} as Environment

const services = [
  {
    id: 'service-1',
    name: 'Argo service',
    source_repo_url: 'https://github.com/qovery/service',
    last_synced_at: '2026-05-05T10:00:00.000Z',
  },
] as ArgocdAppResponse[]

describe('ArgoCdServiceList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseArgoCdServices.mockReturnValue({ data: services })
  })

  it('should navigate to the service overview when clicking the row', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    await userEvent.click(screen.getByRole('row', { name: /argo service/i }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'project-1',
        environmentId: 'env-1',
        serviceId: 'service-1',
      },
    })
  })

  it('should not navigate to the service overview when clicking the repository link', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    await userEvent.click(screen.getByRole('link', { name: /github\.com\/qovery\/service/i }))

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

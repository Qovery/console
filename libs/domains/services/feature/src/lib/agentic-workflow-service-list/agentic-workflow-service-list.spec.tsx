import { type Environment } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowServiceList } from './agentic-workflow-service-list'

const mockUseServices = jest.fn()
const mockNavigate = jest.fn()
const environment = {
  id: 'environment-1',
  organization: { id: 'organization-1' },
  project: { id: 'project-1' },
} as Environment

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: 'organization-1', projectId: 'project-1' }),
  Link: ({ children, params, to, ...props }: { children: ReactNode; params: Record<string, string>; to: string }) => (
    <a {...props} href={Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)}>
      {children}
    </a>
  ),
}))

jest.mock('../hooks/use-services/use-services', () => ({
  useServices: () => mockUseServices(),
}))

jest.mock('../agentic-workflow-service-actions/agentic-workflow-service-actions', () => ({
  AgenticWorkflowServiceActions: ({ service }: { service: { id: string } }) => (
    <button type="button">Actions for {service.id}</button>
  ),
}))

describe('AgenticWorkflowServiceList', () => {
  it('should not render an empty section', () => {
    mockUseServices.mockReturnValue({ data: [] })
    const { container } = renderWithProviders(<AgenticWorkflowServiceList environment={environment} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render agentic workflows in their own section', () => {
    mockUseServices.mockReturnValue({
      data: [
        {
          id: 'workflow-1',
          name: 'Review pull requests',
          enabled: true,
          model: { type: 'CLAUDE' },
          webhook: { url: 'https://api.qovery.com/workflows/workflow-1' },
          service_type: 'AGENTIC_WORKFLOW',
          serviceType: 'AGENTIC_WORKFLOW',
          project_repositories: [
            { url: 'https://github.com/qovery/console', branch: 'staging', git_token_id: 'token-1' },
            { url: 'https://github.com/qovery/docs', branch: 'main', git_token_id: 'token-1' },
          ],
        },
        {
          id: 'workflow-2',
          name: 'Triage incidents',
          enabled: false,
          model: { type: 'BEDROCK' },
          webhook: { url: 'https://api.qovery.com/workflows/workflow-2' },
          service_type: 'AGENTIC_WORKFLOW',
          serviceType: 'AGENTIC_WORKFLOW',
          project_repositories: [],
        },
        { id: 'application-1', name: 'API', service_type: 'APPLICATION', serviceType: 'APPLICATION' },
      ],
    })
    renderWithProviders(<AgenticWorkflowServiceList environment={environment} />)

    expect(screen.getByRole('heading', { name: 'Agentic workflows' })).toBeInTheDocument()
    expect(screen.getByText('Review pull requests')).toBeInTheDocument()
    expect(screen.getByText('Triage incidents')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    expect(screen.getByText('1 enabled')).toBeInTheDocument()
    expect(screen.getByText('Last operation')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('Bedrock')).toBeInTheDocument()
    expect(screen.getByText('https://api.qovery.com/workflows/workflow-1')).toBeInTheDocument()
    expect(screen.getByText('https://api.qovery.com/workflows/workflow-2')).toBeInTheDocument()
    expect(screen.queryByText('Git repositories')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions for workflow-1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review pull requests' })).toHaveAttribute(
      'href',
      expect.stringContaining('/service/workflow-1/overview')
    )
  })
})

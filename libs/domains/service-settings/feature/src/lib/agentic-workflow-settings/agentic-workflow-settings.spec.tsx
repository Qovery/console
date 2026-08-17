import { AgenticWorkflowModelType } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import * as servicesDomain from '@qovery/domains/services/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  AgenticWorkflowSettings,
  agenticWorkflowJsonValidation,
  agenticWorkflowOutputsValidation,
  formatAgenticWorkflowRepositories,
  getGitRepositoryName,
} from './agentic-workflow-settings'

const useGitTokensSpy = jest.spyOn(organizationsDomain, 'useGitTokens') as jest.Mock
const useMcpServersSpy = jest.spyOn(organizationsDomain, 'useMcpServers') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock
const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const editService = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'organization-1',
    projectId: 'project-1',
    environmentId: 'environment-1',
    serviceId: 'workflow-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  AgenticWorkflowCodeEditorField: ({
    label,
    onChange,
    value,
  }: {
    label: string
    onChange: (value: string) => void
    value: string
  }) => <textarea aria-label={label} value={value} onChange={(event) => onChange(event.currentTarget.value)} />,
  GitRepositoryCard: ({
    index,
    repository,
  }: {
    index: number
    repository: { branch: string; gitRepository?: { url: string }; repository: string }
  }) => (
    <div data-testid={`repository-${index}`}>
      {repository.repository}:{repository.branch}:{repository.gitRepository?.url}
    </div>
  ),
}))

const service = {
  id: 'workflow-1',
  service_type: 'AGENTIC_WORKFLOW' as const,
  name: 'Incident assistant',
  description: 'Investigates production incidents',
  enabled: true,
  model: {
    type: AgenticWorkflowModelType.BEDROCK,
    settings: '{"temperature":0.2}',
  },
  agent_prompt: 'Investigate the alert.',
  project_repositories: [
    {
      url: 'https://github.com/qovery/console.git',
      branch: 'staging',
      git_token_id: 'token-1',
    },
  ],
  mcp: '{"mcpServers":{}}',
  mcp_server_ids: ['mcp-1'],
  docker_fragment: 'RUN apt-get update',
  outputs: [{ name: 'Audit log', url: null }],
  governance: { host_allowlist: ['api.github.com', 'status.example.com'] },
  webhook_ip_allowlist: ['10.0.0.0/8'],
  resources: {
    cpu_milli: 500,
    ram_mib: 1024,
    gpu: 0,
    storage_gib: 20,
  },
}

describe('Agentic Workflow settings validation', () => {
  it('rejects malformed JSON', () => {
    expect(agenticWorkflowJsonValidation('{')).toBe('Invalid JSON format.')
  })

  it('accepts an output without a URL and rejects invalid array entries', () => {
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1"}]')).toBe(true)
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1","url":null}]')).toBe(true)
    expect(agenticWorkflowOutputsValidation('[null]')).toBe(
      'Each output must have a name and, when provided, a valid webhook URL.'
    )
  })

  it.each([
    ['https://github.com/qovery/console.git', 'qovery/console'],
    ['https://gitlab.com/qovery/backend', 'qovery/backend'],
    ['qovery/console', 'qovery/console'],
  ])('normalizes the repository value displayed by Git settings', (url, expected) => {
    expect(getGitRepositoryName(url)).toBe(expected)
  })

  it('uses the full repository URL in the edit payload', () => {
    expect(
      formatAgenticWorkflowRepositories([
        {
          repository: 'qovery/console',
          branch: 'staging',
          gitTokenId: 'token-1',
          gitRepository: {
            id: 'repo-1',
            name: 'qovery/console',
            url: 'https://github.com/qovery/console.git',
          },
        },
      ])
    ).toEqual([
      {
        url: 'https://github.com/qovery/console.git',
        branch: 'staging',
        git_token_id: 'token-1',
      },
    ])
  })
})

describe('AgenticWorkflowSettings views', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    editService.mockReset()
    useServiceSpy.mockReturnValue({ data: service })
    useGitTokensSpy.mockReturnValue({ data: [{ id: 'token-1', type: 'GITHUB' }] })
    useMcpServersSpy.mockReturnValue({
      data: [{ id: 'mcp-1', name: 'Documentation', url: 'https://docs.example.com' }],
      isLoading: false,
    })
    useEditServiceSpy.mockReturnValue({ mutate: editService, isLoading: false })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders General and preserves hidden settings and the model provider when saving', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    expect(screen.getByRole('heading', { name: 'General settings' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Incident assistant')
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Investigates production incidents')
    expect(screen.getByRole('spinbutton', { name: 'CPU (mCPU)' })).toHaveValue(500)
    expect(screen.getByRole('spinbutton', { name: 'Memory (MiB)' })).toHaveValue(1024)
    expect(screen.getByRole('spinbutton', { name: 'GPU' })).toHaveValue(0)
    expect(screen.getByRole('spinbutton', { name: 'Storage (GiB)' })).toHaveValue(20)

    await userEvent.clear(screen.getByRole('textbox', { name: 'Description' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Updated description')
    const saveButton = screen.getByRole('button', { name: 'Save' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          description: 'Updated description',
          model: { type: AgenticWorkflowModelType.BEDROCK, settings: '{"temperature":0.2}' },
          outputs: [{ name: 'Audit log', url: null }],
          mcp_server_ids: ['mcp-1'],
        }),
      })
    )
  })

  it('renders AI configuration without exposing the write-only API key', () => {
    renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)

    expect(screen.getByRole('heading', { name: 'AI configuration' })).toBeInTheDocument()
    expect(screen.getByLabelText('API key')).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Model settings JSON' })).toHaveValue('{"temperature":0.2}')
    expect(screen.getByRole('textbox', { name: 'Agent prompt' })).toHaveValue('Investigate the alert.')
  })

  it('renders Connections with the repository base URL, MCP and Docker fragment', () => {
    renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    expect(screen.getByRole('heading', { name: 'Connections' })).toBeInTheDocument()
    expect(screen.getByTestId('repository-0')).toHaveTextContent(
      'qovery/console:staging:https://github.com/qovery/console.git'
    )
    expect(screen.getByRole('textbox', { name: 'MCP JSON' })).toHaveValue('{"mcpServers":{}}')
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Dockerfile fragment' })).toHaveValue('RUN apt-get update')
  })

  it('links to organization Agent settings when no MCP connector exists', () => {
    useMcpServersSpy.mockReturnValue({ data: [], isLoading: false })

    renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    expect(screen.getByRole('link', { name: 'AI settings → Agents' })).toHaveAttribute(
      'href',
      '/organization/organization-1/settings/agents'
    )
  })

  it('renders Outputs with the complete API value', () => {
    renderWithProviders(<AgenticWorkflowSettings page="outputs" />)

    expect(screen.getByRole('heading', { name: 'Outputs' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Output webhooks JSON' })).toHaveValue(
      JSON.stringify(service.outputs, null, 2)
    )
  })

  it('renders Governance allowlists', () => {
    renderWithProviders(<AgenticWorkflowSettings page="governance" />)

    expect(screen.getByRole('heading', { name: 'Governance' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Domain allowlist' })).toHaveValue('api.github.com, status.example.com')
    expect(screen.getByRole('textbox', { name: 'Webhook IP allowlist' })).toHaveValue('10.0.0.0/8')
  })
})

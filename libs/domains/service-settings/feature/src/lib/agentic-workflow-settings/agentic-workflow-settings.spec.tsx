import {
  AgenticWorkflowExecutionMode,
  AgenticWorkflowModelType,
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
} from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import * as servicesDomain from '@qovery/domains/services/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  AgenticWorkflowSettings,
  formatAgenticWorkflowRepositories,
  getGitRepositoryName,
  getGitRepositoryProvider,
  hasAgenticWorkflowSettingsChanges,
} from './agentic-workflow-settings'

const useGitTokensSpy = jest.spyOn(organizationsDomain, 'useGitTokens') as jest.Mock
const useLlmProvidersSpy = jest.spyOn(organizationsDomain, 'useLlmProviders') as jest.Mock
const useLlmProviderModelsSpy = jest.spyOn(organizationsDomain, 'useLlmProviderModels') as jest.Mock
const useMcpServersSpy = jest.spyOn(organizationsDomain, 'useMcpServers') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock
const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const useContextServicesSpy = jest.spyOn(servicesDomain, 'useAgenticWorkflowContextServices') as jest.Mock
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

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useVariables: () => ({ data: [] }),
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
  execution_mode: AgenticWorkflowExecutionMode.IN_PLACE,
  schedule: {
    cron_expression: '0 8 * * 1-5',
    timezone: 'Europe/Paris',
    next_run_at: '2026-08-28T06:00:00Z',
  },
  model: {
    type: AgenticWorkflowModelType.BEDROCK,
    llm_provider_id: 'provider-1',
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
  mcp_servers: [{ id: 'mcp-1', required: true }],
  context_service_ids: [],
  docker_fragment: 'RUN apt-get update',
  outputs: [{ name: 'Audit log', url: null }],
  governance: { host_allowlist: ['api.github.com', 'status.example.com'] },
  webhook_ip_allowlist: ['10.0.0.0/8'],
  resources: {
    cpu_milli: 1000,
    ram_mib: 2048,
    gpu: 0,
    storage_gib: 20,
  },
}

describe('Agentic Workflow settings validation', () => {
  it.each([
    ['https://github.com/qovery/console.git', 'qovery/console'],
    ['https://gitlab.com/qovery/backend', 'qovery/backend'],
    ['qovery/console', 'qovery/console'],
  ])('normalizes the repository value displayed by Git settings', (url, expected) => {
    expect(getGitRepositoryName(url)).toBe(expected)
  })

  it('uses the Git token provider for a self-hosted repository', () => {
    expect(
      getGitRepositoryProvider('https://gitlab.company.com/qovery/backend.git', 'token-1', [
        {
          id: 'token-1',
          name: 'Company GitLab',
          type: 'GITLAB',
          created_at: '2026-09-10T00:00:00Z',
          associated_services_count: 1,
          git_api_url: 'https://gitlab.company.com/api/v4',
        },
      ])
    ).toBe('GITLAB')
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

  it('detects changes only in the settings provided by an overlay', () => {
    const currentValues = {
      name: 'Incident assistant',
      automation: { triggers: [], outputs: [] },
    } as unknown as Parameters<typeof hasAgenticWorkflowSettingsChanges>[0]

    expect(hasAgenticWorkflowSettingsChanges(currentValues, { automation: { triggers: [], outputs: [] } })).toBe(false)
    expect(
      hasAgenticWorkflowSettingsChanges(currentValues, {
        automation: { triggers: [{ id: 'webhook', type: 'webhook' }], outputs: [] },
      })
    ).toBe(true)
  })
})

describe('AgenticWorkflowSettings views', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    editService.mockReset()
    useServiceSpy.mockReturnValue({ data: service })
    useGitTokensSpy.mockReturnValue({ data: [{ id: 'token-1', type: 'GITHUB' }], isLoading: false })
    useLlmProvidersSpy.mockReturnValue({ data: [] })
    useLlmProviderModelsSpy.mockReturnValue({
      data: [{ id: 'eu.anthropic.claude-opus-5', display_name: 'Claude Opus 5', created_at: null }],
      isError: false,
      isLoading: false,
    })
    useMcpServersSpy.mockReturnValue({
      data: [{ id: 'mcp-1', name: 'Documentation', url: 'https://docs.example.com' }],
      isLoading: false,
    })
    useContextServicesSpy.mockReturnValue({ data: [], isLoading: false })
    useEditServiceSpy.mockReturnValue({ mutateAsync: editService, isLoading: false })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders General and preserves hidden settings and the model provider when saving', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    expect(screen.getByRole('heading', { name: 'General settings' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Incident assistant')
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Investigates production incidents')
    expect(screen.getByRole('spinbutton', { name: 'CPU (mCPU)' })).toHaveValue(1000)
    expect(screen.getByRole('spinbutton', { name: 'Memory (MiB)' })).toHaveValue(2048)
    expect(screen.getByRole('spinbutton', { name: 'GPU' })).toHaveValue(0)
    expect(screen.getByRole('spinbutton', { name: 'Storage (GiB)' })).toHaveValue(20)
    expect(screen.getByRole('button', { name: /In place/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Clone environment/ })).toHaveAttribute('aria-pressed', 'false')

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
          execution_mode: AgenticWorkflowExecutionMode.IN_PLACE,
          model: {
            type: AgenticWorkflowModelType.BEDROCK,
            llm_provider_id: 'provider-1',
            settings: '{"temperature":0.2}',
          },
          mcp: '{"mcpServers":{}}',
          outputs: [{ name: 'Audit log', url: null }],
          mcp_servers: [{ id: 'mcp-1', required: true }],
          context_service_ids: [],
          webhook_ip_allowlist: ['10.0.0.0/8'],
          schedule: {
            cron_expression: '0 8 * * 1-5',
            timezone: 'Europe/Paris',
          },
        }),
      })
    )
  })

  it('updates the execution mode', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await userEvent.click(screen.getByRole('button', { name: /Clone environment/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({ execution_mode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT }),
      })
    )
  })

  it('renders AI configuration with a stored token only', () => {
    renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)

    expect(screen.getByRole('heading', { name: 'AI configuration' })).toBeInTheDocument()
    expect(screen.getByLabelText('Token')).toBeInTheDocument()
    expect(screen.queryByLabelText('API key')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Cloud settings JSON' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Instructions' })).toBeInTheDocument()
  })

  it('prevents saving empty instructions', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)

    const instructions = screen.getByRole('textbox', { name: 'Instructions' })
    await userEvent.click(instructions)
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')

    await waitFor(() => expect(screen.getByText('Please enter instructions.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('renders Connections with the repository base URL and MCP', () => {
    renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    expect(screen.getByRole('heading', { name: 'Connections' })).toBeInTheDocument()
    expect(screen.getByText('qovery/console')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('uses legacy MCP server IDs when the structured MCP list is empty', () => {
    useServiceSpy.mockReturnValue({ data: { ...service, mcp_servers: [] } })

    renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('rebuilds the context services prompt block and drops unavailable service IDs before saving', async () => {
    useServiceSpy.mockReturnValue({
      data: {
        ...service,
        agent_prompt:
          'Investigate.\n\n<!-- qovery-context-services:start -->\n## Context services\n- stale-api (APPLICATION) — service ID: stale-service\n<!-- qovery-context-services:end -->',
        context_service_ids: ['service-1', 'deleted-service'],
      },
    })
    useContextServicesSpy.mockReturnValue({
      data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await userEvent.clear(screen.getByRole('textbox', { name: 'Description' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Updated description')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          agent_prompt:
            'Investigate.\n\n<!-- qovery-context-services:start -->\n## Context services\n- api (APPLICATION) — service ID: service-1\n<!-- qovery-context-services:end -->',
          context_service_ids: ['service-1'],
        }),
      })
    )
  })

  it('preserves persisted service context when the context services query fails', async () => {
    const agentPrompt =
      'Investigate.\n\n<!-- qovery-context-services:start -->\n## Context services\n- api (APPLICATION) — service ID: service-1\n<!-- qovery-context-services:end -->'
    useServiceSpy.mockReturnValue({
      data: { ...service, agent_prompt: agentPrompt, context_service_ids: ['service-1'] },
    })
    useContextServicesSpy.mockReturnValue({ data: undefined, isError: true, isLoading: false })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await userEvent.clear(screen.getByRole('textbox', { name: 'Description' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Updated description')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          agent_prompt: agentPrompt,
          context_service_ids: ['service-1'],
        }),
      })
    )
  })

  it('preserves persisted service context during an unrelated overlay save while context services are loading', async () => {
    const agentPrompt =
      'Investigate.\n\n<!-- qovery-context-services:start -->\n## Context services\n- api (APPLICATION) — service ID: service-1\n<!-- qovery-context-services:end -->'
    useServiceSpy.mockReturnValue({
      data: { ...service, agent_prompt: agentPrompt, context_service_ids: ['service-1'] },
    })
    useContextServicesSpy.mockReturnValue({ data: undefined, isLoading: true })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="advanced-settings" />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete Dockerfile fragment' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          agent_prompt: agentPrompt,
          context_service_ids: ['service-1'],
          docker_fragment: '',
        }),
      })
    )
  })

  it('prevents editing a private self-hosted repository until its provider is resolved', () => {
    useServiceSpy.mockReturnValue({
      data: {
        ...service,
        project_repositories: [
          {
            url: 'https://gitlab.company.com/qovery/backend.git',
            branch: 'main',
            git_token_id: 'token-1',
          },
        ],
      },
    })
    useGitTokensSpy.mockReturnValue({ data: undefined, isLoading: true })

    renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    expect(screen.getByRole('button', { name: 'Manage context' })).toBeDisabled()
  })

  it('preserves malformed legacy MCP JSON when saving Connections changes', async () => {
    useServiceSpy.mockReturnValue({ data: { ...service, mcp: '{invalid' } })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    await userEvent.click(screen.getByRole('button', { name: 'Manage MCP' }))
    await userEvent.click(screen.getByRole('button', { name: 'Remove Documentation' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(editService).toHaveBeenCalledWith({
      serviceId: 'workflow-1',
      payload: expect.objectContaining({ mcp: '{invalid', mcp_servers: [] }),
    })
  })

  it('opens the MCP manager when no MCP exists', async () => {
    useMcpServersSpy.mockReturnValue({ data: [], isLoading: false })

    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="connections" />)

    await userEvent.click(screen.getByRole('button', { name: 'Manage MCP' }))

    expect(screen.getByRole('heading', { name: 'Manage MCP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New MCP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders Automations with the configured trigger', () => {
    renderWithProviders(<AgenticWorkflowSettings page="automations" />)

    expect(screen.getByRole('heading', { name: 'Automations' })).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.queryByText('1 output configured')).not.toBeInTheDocument()
  })

  it('does not save unchanged Automations from the side panel', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="automations" />)

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(editService).not.toHaveBeenCalled()
  })

  it('renders Outputs with the configured output count', () => {
    renderWithProviders(<AgenticWorkflowSettings page="outputs" />)

    expect(screen.getByRole('heading', { name: 'Outputs' })).toBeInTheDocument()
    expect(screen.getByText('1 output configured')).toBeInTheDocument()
  })

  it('renders Governance allowlists', () => {
    renderWithProviders(<AgenticWorkflowSettings page="governance" />)

    expect(screen.getByRole('heading', { name: 'Governance' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Domain allowlist' })).toHaveValue('api.github.com, status.example.com')
    expect(screen.queryByRole('textbox', { name: 'Webhook IP allowlist' })).not.toBeInTheDocument()
  })

  it('deletes the Dockerfile fragment without a page-level save', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="advanced-settings" />)

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete Dockerfile fragment' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({ docker_fragment: '' }),
      })
    )
  })
})

describe('AgenticWorkflowSettings model type', () => {
  const llmProvider = (id: string, name: string, type: LlmProviderType): LlmProviderResponse => ({
    id,
    name,
    type,
    description: '',
    scope: LlmProviderScope.ORGANIZATION,
    has_credential: true,
    created_at: '2026-09-23T00:00:00Z',
    updated_at: '2026-09-23T00:00:00Z',
  })
  const claudeProvider = llmProvider('provider-claude', 'Claude token', LlmProviderType.CLAUDE)
  const bedrockProvider = llmProvider('provider-bedrock', 'Bedrock token', LlmProviderType.BEDROCK)
  const gatewayProvider = llmProvider('provider-gateway', 'Gateway token', LlmProviderType.ANTHROPIC_COMPATIBLE)
  const providers = [claudeProvider, bedrockProvider, gatewayProvider]

  // What a backend without `model.type` returns.
  const serviceWithoutModelType = (llmProviderId: string | null, settings = '{"model":"saved-model"}') => ({
    ...service,
    model: { llm_provider_id: llmProviderId, settings },
  })

  const saveDescription = async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
    await userEvent.clear(screen.getByRole('textbox', { name: 'Description' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Updated description')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  }

  beforeEach(() => {
    jest.useFakeTimers()
    editService.mockReset()
    useGitTokensSpy.mockReturnValue({ data: [{ id: 'token-1', type: 'GITHUB' }], isLoading: false })
    useLlmProviderModelsSpy.mockReturnValue({
      data: [
        { id: 'first-model', display_name: 'First model', created_at: null },
        { id: 'saved-model', display_name: 'Saved model', created_at: null },
      ],
      isError: false,
      isLoading: false,
    })
    useMcpServersSpy.mockReturnValue({ data: [], isLoading: false })
    useContextServicesSpy.mockReturnValue({ data: [], isLoading: false })
    useEditServiceSpy.mockReturnValue({ mutateAsync: editService, isLoading: false })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it.each([
    [LlmProviderType.CLAUDE, claudeProvider, AgenticWorkflowModelType.CLAUDE],
    [LlmProviderType.ANTHROPIC_COMPATIBLE, gatewayProvider, AgenticWorkflowModelType.CLAUDE],
    [LlmProviderType.BEDROCK, bedrockProvider, AgenticWorkflowModelType.BEDROCK],
  ])(
    'sends the workflow type of a saved %s provider when the response has no model type',
    async (_, provider, expectedType) => {
      useServiceSpy.mockReturnValue({ data: serviceWithoutModelType(provider.id) })
      useLlmProvidersSpy.mockReturnValue({ data: providers })
      const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

      await saveDescription(userEvent)

      await waitFor(() =>
        expect(editService).toHaveBeenCalledWith({
          serviceId: 'workflow-1',
          payload: expect.objectContaining({
            model: { type: expectedType, llm_provider_id: provider.id, settings: '{"model":"saved-model"}' },
          }),
        })
      )
    }
  )

  it('prefers the saved provider over the model type of an older response', async () => {
    useServiceSpy.mockReturnValue({
      data: { ...service, model: { ...service.model, type: AgenticWorkflowModelType.CLAUDE } },
    })
    useLlmProvidersSpy.mockReturnValue({ data: [{ ...bedrockProvider, id: 'provider-1' }] })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await saveDescription(userEvent)

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          model: expect.objectContaining({ type: AgenticWorkflowModelType.BEDROCK }),
        }),
      })
    )
  })

  it('keeps sending the model type of an older response while the providers are loading', async () => {
    useServiceSpy.mockReturnValue({
      data: { ...service, model: { ...service.model, type: AgenticWorkflowModelType.CLAUDE } },
    })
    useLlmProvidersSpy.mockReturnValue({ data: undefined, isLoading: true })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await saveDescription(userEvent)

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({ model: expect.objectContaining({ type: AgenticWorkflowModelType.CLAUDE }) }),
      })
    )
  })

  it('does not invent a model type while the providers load for a response without one', async () => {
    useServiceSpy.mockReturnValue({ data: serviceWithoutModelType('provider-bedrock') })
    useLlmProvidersSpy.mockReturnValue({ data: undefined, isLoading: true })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="general" />)

    await saveDescription(userEvent)

    await waitFor(() => expect(editService).toHaveBeenCalledTimes(1))
    const { model } = editService.mock.calls[0][0].payload
    expect(model.type).toBeUndefined()
    expect(model.llm_provider_id).toBe('provider-bedrock')
  })

  it('shows the model picker once the providers load and keeps the saved model', async () => {
    useServiceSpy.mockReturnValue({ data: serviceWithoutModelType('provider-bedrock') })
    useLlmProvidersSpy.mockReturnValue({ data: undefined, isLoading: true })
    const { userEvent, rerender } = renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)
    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()

    useLlmProvidersSpy.mockReturnValue({ data: providers, isLoading: false })
    rerender(<AgenticWorkflowSettings page="ai-configuration" />)

    expect(await screen.findByLabelText('Model')).toBeInTheDocument()
    expect(useLlmProviderModelsSpy).toHaveBeenLastCalledWith({ llmProviderId: 'provider-bedrock', enabled: true })
    expect(screen.getByText('Saved model')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    await selectEvent.select(screen.getByLabelText('Model'), 'First model', { container: document.body })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          model: {
            type: AgenticWorkflowModelType.BEDROCK,
            llm_provider_id: 'provider-bedrock',
            settings: JSON.stringify({ model: 'first-model' }, null, 2),
          },
        }),
      })
    )
  })

  it.each([
    [LlmProviderType.BEDROCK, bedrockProvider, AgenticWorkflowModelType.BEDROCK],
    [LlmProviderType.ANTHROPIC_COMPATIBLE, gatewayProvider, AgenticWorkflowModelType.CLAUDE],
  ])('sends the workflow type of a newly selected %s provider', async (_, provider, expectedType) => {
    useServiceSpy.mockReturnValue({ data: serviceWithoutModelType(claudeProvider.id) })
    useLlmProvidersSpy.mockReturnValue({ data: providers })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)

    await selectEvent.select(screen.getByLabelText('Token'), provider.name, { container: document.body })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          model: expect.objectContaining({ type: expectedType, llm_provider_id: provider.id }),
        }),
      })
    )
  })

  it('requires a provider before saving and binds the newly selected provider', async () => {
    useServiceSpy.mockReturnValue({
      data: { ...service, model: { type: AgenticWorkflowModelType.CLAUDE, llm_provider_id: null, settings: '{}' } },
    })
    useLlmProvidersSpy.mockReturnValue({ data: providers })
    const { userEvent } = renderWithProviders(<AgenticWorkflowSettings page="ai-configuration" />)

    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    await selectEvent.select(screen.getByLabelText('Token'), bedrockProvider.name, { container: document.body })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(editService).toHaveBeenCalledWith({
        serviceId: 'workflow-1',
        payload: expect.objectContaining({
          model: expect.objectContaining({
            type: AgenticWorkflowModelType.BEDROCK,
            llm_provider_id: bedrockProvider.id,
          }),
        }),
      })
    )
  })
})

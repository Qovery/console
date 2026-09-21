import posthog from 'posthog-js'
import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, type AgenticWorkflowFormData } from '../agentic-workflow-context'
import { type AgenticWorkflowTemplate } from '../agentic-workflow-templates'
import {
  AgenticWorkflowConfiguration,
  areVariablesValid,
  getInvalidVariableField,
  getJsonError,
  isGitRepositoryComplete,
  summarizeTriggers,
} from './agentic-workflow-configuration'

const mockNavigate = jest.fn()
const mockCreateService = jest.fn()
const mockImportVariables = jest.fn()
const mockCreateQoveryMcpServer = jest.fn()
const mockRefetchMcpServers = jest.fn()
let mockMcpServers: Array<Record<string, unknown>> = []
let mockMcpServersError = false
let mockMcpServersLoading = false
let mockCreateQoveryMcpServerLoading = false
let mockContextServicesLoading = false
let mockLlmProviders: Array<{ id: string; has_credential: boolean; type: string }> = []

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1', environmentId: 'environment-1' }),
}))

jest.mock('posthog-js', () => ({ capture: jest.fn() }))

jest.mock('../../../hooks/use-create-service/use-create-service', () => ({
  useCreateService: () => ({ isLoading: false, mutateAsync: mockCreateService }),
}))

jest.mock('../../../hooks/use-agentic-workflow-context-services/use-agentic-workflow-context-services', () => ({
  useAgenticWorkflowContextServices: () => ({
    data: [
      { id: 'application-1', name: 'api', type: 'APPLICATION' },
      { id: 'database-1', name: 'postgres', type: 'DATABASE' },
    ],
    isLoading: mockContextServicesLoading,
  }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: () => <div>Git branch</div>,
  GitProviderSetting: () => <div>Git provider</div>,
  GitRepositorySetting: () => <div>Git repository</div>,
  LlmProviderSetting: ({
    children,
    displayEmptyState,
    error,
    isLoading,
    llmProviders,
    onChange,
    value,
  }: {
    children?: ReactNode
    displayEmptyState?: boolean
    error?: string
    isLoading?: boolean
    llmProviders: Array<{ id: string }>
    onChange: (value: string) => void
    value: string
  }) =>
    displayEmptyState && !value && llmProviders.length === 0 && !isLoading ? (
      <div>
        <p>No token available</p>
        <button type="button">New token</button>
        {error ? <p role="alert">{error}</p> : null}
      </div>
    ) : (
      <>
        <button type="button" onClick={() => onChange('provider-1')}>
          Select stored token
        </button>
        {children}
      </>
    ),
  McpServerCreateEditModal: () => <div>Create MCP server</div>,
  McpServerSetting: () => <div>Organization MCP connectors</div>,
  useCreateQoveryMcpServer: () => ({
    isLoading: mockCreateQoveryMcpServerLoading,
    mutateAsync: mockCreateQoveryMcpServer,
  }),
  useLlmProviders: () => ({ data: mockLlmProviders, isLoading: false }),
  useMcpServers: () => ({
    data: mockMcpServers,
    isError: mockMcpServersError,
    isLoading: mockMcpServersLoading,
    refetch: mockRefetchMcpServers,
  }),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  ...jest.requireActual('@qovery/domains/variables/feature'),
  useImportVariables: () => ({ isLoading: false, mutateAsync: mockImportVariables }),
}))

jest.mock('./agentic-workflow-prompt-editor', () => ({
  AgenticWorkflowPromptEditor: jest
    .requireActual('react')
    .forwardRef<
      { focusPrompt: () => void },
      { onPromptChange: (value: string) => void; prompt: string }
    >(function AgenticWorkflowPromptEditor({ onPromptChange, prompt }, ref) {
      jest.requireActual('react').useImperativeHandle(ref, () => ({ focusPrompt: () => undefined }))
      return (
        <textarea
          aria-label="Instructions"
          placeholder="Type your instructions here…"
          value={prompt}
          onChange={(event: { currentTarget: { value: string } }) => onPromptChange(event.currentTarget.value)}
        />
      )
    }),
}))

jest.mock('../agentic-workflow-schedule-fields', () => ({
  ...jest.requireActual('../agentic-workflow-schedule-fields'),
  AgenticWorkflowScheduleFields: () => <div>Schedule</div>,
}))

function renderConfiguration({
  onExit = jest.fn(),
  seed,
  variablesSeed,
  requiresQoveryMcp,
}: {
  onExit?: () => void
  seed?: Partial<AgenticWorkflowFormData>
  variablesSeed?: AgenticWorkflowTemplate['variables']
  requiresQoveryMcp?: boolean
} = {}) {
  const selectedTemplate =
    seed || variablesSeed || requiresQoveryMcp
      ? {
          id: 'test-template',
          title: 'Test template',
          description: 'Template used by configuration tests',
          seed: seed ?? {},
          variables: variablesSeed,
          requiresQoveryMcp,
        }
      : undefined

  return renderWithProviders(
    <AgenticWorkflowCreationFlow onExit={onExit} selectedTemplate={selectedTemplate}>
      <AgenticWorkflowConfiguration />
    </AgenticWorkflowCreationFlow>
  )
}

const validSeed: Partial<AgenticWorkflowFormData> = {
  name: 'review-agent',
  agentPrompt: 'Review incoming payloads.',
  llmProviderId: 'provider-1',
  automations: [{ id: 'automation-1', triggers: [{ id: 'webhook-1', type: 'webhook' }], outputs: [] }],
}

describe('AgenticWorkflowConfiguration validation', () => {
  beforeEach(() => {
    mockMcpServers = []
    mockCreateQoveryMcpServer.mockReset().mockResolvedValue({
      id: 'qovery-mcp',
      name: 'Qovery MCP',
      url: 'https://mcp.qovery.com/mcp',
      scope: 'ORGANIZATION',
      attachable: true,
    })
  })
  it('should require valid JSON only when a required JSON field is empty or invalid', () => {
    expect(getJsonError('', false)).toBeUndefined()
    expect(getJsonError('', true)).toBe('Please enter a valid JSON configuration.')
    expect(getJsonError('{"mcpServers":{}}', true)).toBeUndefined()
    expect(getJsonError('{invalid', true)).toBe('Invalid JSON format.')
  })

  it('should require token, repository, and branch for configured repositories', () => {
    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: 'main',
      })
    ).toBe(true)

    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: '',
      })
    ).toBe(false)
  })

  it('should require complete environment variables', () => {
    expect(areVariablesValid([])).toBe(true)
    expect(areVariablesValid([{ variable: '', value: '', scope: 'AGENTIC_WORKFLOW', isSecret: false }])).toBe(false)
    expect(areVariablesValid([{ variable: 'API URL', value: 'https://example.com', scope: 'AGENTIC_WORKFLOW' }])).toBe(
      false
    )
    expect(areVariablesValid([{ variable: 'API_URL', value: 'https://example.com', scope: 'AGENTIC_WORKFLOW' }])).toBe(
      true
    )
  })

  it('should resolve the first invalid variable field in focus order', () => {
    expect(getInvalidVariableField({ variable: 'API_KEY', value: 'secret', isSecret: true })).toBe('scope')
    expect(getInvalidVariableField({ variable: 'API_KEY', value: '', scope: 'AGENTIC_WORKFLOW', isSecret: true })).toBe(
      'value'
    )
    expect(
      getInvalidVariableField({ variable: 'API KEY', value: 'secret', scope: 'AGENTIC_WORKFLOW', isSecret: true })
    ).toBe('variable')
  })

  it('should summarize schedule triggers with their configured value', () => {
    expect(
      summarizeTriggers({
        id: 'automation-1',
        triggers: [
          { id: 'webhook-1', type: 'webhook' },
          { id: 'schedule-1', type: 'schedule', cronExpression: '0 8 * * 1-5', timezone: 'Europe/Paris' },
        ],
        outputs: [],
      })
    ).toBe('Webhook + At 08:00 AM, Monday through Friday (Europe/Paris)')
  })
})

describe('AgenticWorkflowConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMcpServers = []
    mockMcpServersError = false
    mockMcpServersLoading = false
    mockCreateQoveryMcpServerLoading = false
    mockContextServicesLoading = false
    mockLlmProviders = [{ id: 'provider-1', has_credential: true, type: 'CLAUDE' }]
    mockRefetchMcpServers.mockImplementation(async () => ({ data: mockMcpServers, isError: false }))
    mockCreateQoveryMcpServer.mockResolvedValue({
      id: 'qovery-mcp',
      name: 'Qovery MCP',
      url: 'https://mcp.qovery.com/mcp',
      scope: 'ORGANIZATION',
      attachable: true,
    })
    mockCreateService.mockResolvedValue({ id: 'workflow-1' })
    mockImportVariables.mockResolvedValue(undefined)
  })

  it('should place the name before the prompt and focus the name on mount', () => {
    renderConfiguration()

    const name = screen.getByRole('textbox', { name: 'Name' })
    const prompt = screen.getByRole('textbox', { name: 'Instructions' })

    expect(name.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(name).toHaveFocus()
    expect(prompt).not.toHaveFocus()
    expect(screen.getByPlaceholderText('New agent task')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your instructions here…')).toBeInTheDocument()
    expect(screen.queryByTestId('progress-bar-wrapper')).not.toBeInTheDocument()
  })

  it('should leave the creation page from the top-left back action', async () => {
    const onExit = jest.fn()
    const { userEvent } = renderConfiguration({ onExit })

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('should expose governance as its own section with a domain allowlist', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Governance/ }))

    expect(screen.getByRole('textbox', { name: 'Domain allowlist' })).toBeInTheDocument()
  })

  it('should group the Dockerfile fragment under advanced settings', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Advanced settings/ }))

    expect(screen.getByRole('heading', { name: 'Dockerfile fragment' })).toBeInTheDocument()
    expect(screen.queryByText('Advanced MCP configuration')).not.toBeInTheDocument()
  })

  it('should configure the execution mode from advanced settings', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Advanced settings/ }))
    await userEvent.click(screen.getByRole('button', { name: /Clone environment/ }))

    expect(screen.getByRole('button', { name: /Clone environment/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /In place/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('should configure context, provider, triggers, and output from the main canvas', async () => {
    const { userEvent } = renderConfiguration()

    expect(screen.queryByRole('button', { name: 'Add context' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Add from Git repository/ }))
    expect(screen.getByRole('heading', { name: 'Add from Git repository' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.click(screen.getByRole('button', { name: /Add Qovery services/ }))
    expect(screen.getByRole('heading', { name: 'Import existing Qovery services' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Services to include' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'api' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.click(screen.getByRole('button', { name: 'Add provider' }))
    expect(screen.getByRole('heading', { name: 'Configure provider' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select stored token' })).toBeInTheDocument()
    expect(screen.queryByLabelText('API key')).not.toBeInTheDocument()
    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))

    await userEvent.click(screen.getByRole('button', { name: 'Add trigger' }))
    expect(screen.getByRole('heading', { name: 'Configure triggers' })).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('Triggers')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).queryByText('Outputs')).not.toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: 'Enable agent task' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'From a webhook' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }))

    expect(screen.getByRole('button', { name: 'Webhook' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add output' }))
    expect(screen.getByRole('heading', { name: 'Configure output' })).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('Outputs')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).queryByText('Triggers')).not.toBeInTheDocument()
  })

  it('should show the provider empty state when no token is available', async () => {
    mockLlmProviders = []
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add provider' }))

    expect(screen.getByText('No token available')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New token' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a token.')
    expect(screen.queryByRole('button', { name: 'Select stored token' })).not.toBeInTheDocument()
    expect(screen.queryByText('Cloud settings JSON')).not.toBeInTheDocument()
  })

  it('should replace empty context cards with the add context menu once a context is selected', async () => {
    const { userEvent } = renderConfiguration({
      seed: { contextServices: [{ id: 'application-1', name: 'api', type: 'APPLICATION' }] },
    })

    expect(screen.queryByRole('button', { name: /Add from Git repository/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add Qovery services/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add context' }))
    expect(screen.getByRole('menuitem', { name: 'Git repository' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Qovery services' })).toBeInTheDocument()
  })

  it('should keep an incomplete Git repository editable', async () => {
    const { userEvent } = renderConfiguration({
      seed: { gitRepositories: [{ provider: 'GITHUB', repository: '', branch: '' }] },
    })

    expect(screen.getByText('Configure Git repository')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Manage context' }))

    expect(screen.getByRole('heading', { name: 'Edit Git repository' })).toBeInTheDocument()
  })

  it('should prevent opening Qovery service context while services are loading', async () => {
    mockContextServicesLoading = true
    const { userEvent } = renderConfiguration()
    const addQoveryServices = screen.getByRole('button', { name: /Add Qovery services/ })

    expect(addQoveryServices).toBeDisabled()
    await userEvent.click(addQoveryServices)

    expect(screen.queryByRole('heading', { name: 'Import existing Qovery services' })).not.toBeInTheDocument()
  })

  it('should prevent opening Qovery service context while MCP servers are loading', () => {
    mockMcpServersLoading = true
    renderConfiguration()

    expect(screen.getByRole('button', { name: /Add Qovery services/ })).toBeDisabled()
  })

  it('should manage MCP from a side panel', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    expect(screen.getByRole('heading', { name: 'Manage MCP' })).toBeInTheDocument()
  })

  it('should create and lock the Qovery MCP when Qovery service context is added', async () => {
    mockCreateQoveryMcpServer.mockResolvedValue({
      id: 'qovery-mcp',
      name: 'Qovery MCP',
      url: 'https://mcp.qovery.com/mcp',
      scope: 'ORGANIZATION',
    })
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledWith({ organizationId: 'org-1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))

    expect(
      screen.getByRole('button', {
        name: 'MCP Qovery: This MCP is required by the selected Qovery service context and cannot be removed.',
      })
    ).toBeDisabled()
  })

  it('should automatically select an existing Qovery MCP without creating another one', async () => {
    mockMcpServers = [
      {
        id: 'existing-qovery-mcp',
        name: 'Qovery MCP',
        url: 'https://mcp.qovery.com/mcp',
        scope: 'ORGANIZATION',
        attachable: true,
      },
    ]
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))

    expect(mockCreateQoveryMcpServer).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', {
        name: 'MCP Qovery: This MCP is required by the selected Qovery service context and cannot be removed.',
      })
    ).toBeDisabled()
  })

  it('should create an attachable Qovery MCP when the existing one cannot be attached', async () => {
    mockMcpServers = [
      {
        id: 'unattachable-qovery-mcp',
        name: 'Qovery MCP',
        url: 'https://mcp.qovery.com/mcp',
        scope: 'ORGANIZATION',
        attachable: false,
      },
    ]
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledWith({ organizationId: 'org-1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    expect(
      screen.getByRole('button', {
        name: 'MCP Qovery: This MCP is required by the selected Qovery service context and cannot be removed.',
      })
    ).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Add MCP Qovery' })).not.toBeInTheDocument()
  })

  it('should create and select the Qovery MCP for templates that require it', async () => {
    const { userEvent } = renderConfiguration({ requiresQoveryMcp: true })

    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledWith({ organizationId: 'org-1' }))
    await waitFor(() => expect(screen.queryByLabelText('Configuring MCP Qovery')).not.toBeInTheDocument())
    await userEvent.hover(screen.getByText('MCP Qovery'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This MCP is required by the selected agent template and cannot be removed.'
    )
    expect(screen.queryByRole('button', { name: 'Remove MCP Qovery' })).not.toBeInTheDocument()
  })

  it('should select an existing Qovery MCP using its origin URL for templates that require it', async () => {
    mockMcpServers = [
      {
        id: 'existing-qovery-mcp',
        name: 'qovery',
        url: 'https://mcp.qovery.com',
        scope: 'ORGANIZATION',
        attachable: true,
      },
    ]

    const { userEvent } = renderConfiguration({ requiresQoveryMcp: true })

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    expect(
      screen.getByRole('button', {
        name: 'MCP Qovery: This MCP is required by the selected agent template and cannot be removed.',
      })
    ).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Remove MCP Qovery' })).not.toBeInTheDocument()
    expect(mockCreateQoveryMcpServer).not.toHaveBeenCalled()
  })

  it('should share Qovery MCP initialization between a template and service context', async () => {
    const creation = deferred<{
      id: string
      name: string
      url: string
      scope: string
      attachable: boolean
    }>()
    mockCreateQoveryMcpServer.mockReturnValue(creation.promise)
    const { userEvent } = renderConfiguration({ requiresQoveryMcp: true })
    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1))

    await userEvent.click(screen.getByRole('button', { name: /Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

    creation.resolve({
      id: 'qovery-mcp',
      name: 'Qovery MCP',
      url: 'https://mcp.qovery.com/mcp',
      scope: 'ORGANIZATION',
      attachable: true,
    })
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Import existing Qovery services' })).not.toBeInTheDocument()
    )
    expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1)
  })

  it('should immediately show the preconfigured Qovery MCP while a template initializes it', async () => {
    const creation = deferred<{
      id: string
      name: string
      url: string
      scope: string
      attachable: boolean
    }>()
    mockCreateQoveryMcpServer.mockReturnValue(creation.promise)
    mockCreateQoveryMcpServerLoading = true

    renderConfiguration({ requiresQoveryMcp: true })

    expect(screen.getByText('MCP Qovery')).toBeInTheDocument()
    expect(screen.getByLabelText('Configuring MCP Qovery')).toBeInTheDocument()
    const createButton = screen.getByRole('button', { name: 'Create' })
    expect(createButton).toHaveClass('pointer-events-none')
    expect(within(createButton).getByTestId('spinner')).toBeInTheDocument()
    expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1)
  })

  it('should show the preconfigured Qovery MCP when it exists but is not selected yet', () => {
    mockMcpServers = [
      {
        id: 'existing-qovery-mcp',
        name: 'qovery',
        url: 'https://mcp.qovery.com',
        scope: 'ORGANIZATION',
        attachable: true,
      },
    ]
    mockMcpServersLoading = true

    renderConfiguration({ requiresQoveryMcp: true })

    expect(screen.getByText('MCP Qovery')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(mockCreateQoveryMcpServer).not.toHaveBeenCalled()
  })

  it('should disable creation for Qovery service context while MCP servers are loading', () => {
    mockMcpServersLoading = true

    renderConfiguration({
      seed: { ...validSeed, contextServices: [{ id: 'application-1', name: 'api', type: 'APPLICATION' }] },
    })

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(mockCreateQoveryMcpServer).not.toHaveBeenCalled()
  })

  it('should not create a Qovery MCP when the MCP server list cannot be loaded', async () => {
    mockMcpServersError = true
    mockRefetchMcpServers.mockResolvedValue({
      data: undefined,
      error: new Error('MCP servers failed to load'),
      isError: true,
    })

    renderConfiguration({ requiresQoveryMcp: true })

    await waitFor(() => expect(mockRefetchMcpServers).toHaveBeenCalled())
    expect(mockCreateQoveryMcpServer).not.toHaveBeenCalled()
  })

  it('should wait for the required Qovery MCP before creating from a template', async () => {
    const creation = deferred<{
      id: string
      name: string
      url: string
      scope: string
      attachable: boolean
    }>()
    mockCreateQoveryMcpServer.mockReturnValue(creation.promise)
    const { userEvent } = renderConfiguration({ requiresQoveryMcp: true, seed: validSeed })
    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1))

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(mockCreateService).not.toHaveBeenCalled()

    creation.resolve({
      id: 'qovery-mcp',
      name: 'Qovery MCP',
      url: 'https://mcp.qovery.com/mcp',
      scope: 'ORGANIZATION',
      attachable: true,
    })

    await waitFor(() =>
      expect(mockCreateService).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ mcp_servers: [{ id: 'qovery-mcp', required: true }] }),
        })
      )
    )
  })

  it('should prevent duplicate submissions while creation is pending', async () => {
    const creation = deferred<{ id: string }>()
    mockCreateService.mockReturnValue(creation.promise)
    const { userEvent } = renderConfiguration({ seed: validSeed })

    await userEvent.dblClick(screen.getByRole('button', { name: 'Create' }))

    expect(mockCreateService).toHaveBeenCalledTimes(1)
    creation.resolve({ id: 'workflow-1' })
  })

  it('should not create from a template when the required Qovery MCP cannot be initialized', async () => {
    mockCreateQoveryMcpServer.mockRejectedValue(new Error('MCP creation failed'))
    const { userEvent } = renderConfiguration({ requiresQoveryMcp: true, seed: validSeed })
    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(1))

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(mockCreateQoveryMcpServer).toHaveBeenCalledTimes(2))
    expect(mockCreateService).not.toHaveBeenCalled()
  })

  it('should surface validation feedback when a creation action is clicked with incomplete configuration', async () => {
    const { userEvent } = renderConfiguration()
    const createButton = screen.getByRole('button', { name: 'Create' })

    expect(createButton).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Create and deploy' })).not.toBeInTheDocument()

    await userEvent.click(createButton)
    expect(screen.getByText('Please enter an agent task name.')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'review-agent')
    await userEvent.type(screen.getByRole('textbox', { name: /Instructions/ }), 'Review incoming payloads.')

    await userEvent.click(screen.getByRole('button', { name: 'Add provider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select stored token' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))

    expect(createButton).toBeEnabled()

    await userEvent.click(createButton)

    expect(screen.getByText('Trigger required')).toHaveClass('text-negative')
    expect(screen.queryByRole('heading', { name: 'Configure triggers' })).not.toBeInTheDocument()
    expect(screen.queryByText('At least one trigger is required.')).not.toBeInTheDocument()
    expect(mockCreateService).not.toHaveBeenCalled()
  })

  it('should show variable errors and focus the first invalid value', async () => {
    const { userEvent } = renderConfiguration({
      seed: validSeed,
      variablesSeed: [
        {
          variable: 'INCIDENT_API_KEY',
          value: '',
          scope: 'AGENTIC_WORKFLOW',
          isSecret: true,
        },
      ],
    })

    await userEvent.click(screen.getByRole('button', { name: /Environment variables/ }))
    expect(screen.getByRole('button', { name: /Environment variables/ })).toHaveAttribute('data-state', 'closed')

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Environment variables/ })).toHaveAttribute('data-state', 'open')
      expect(screen.queryByText('Complete every environment variable name and value.')).not.toBeInTheDocument()
      expect(screen.getByText('Environment variables').closest('button')).toHaveClass('bg-surface-negative-subtle')
      expect(screen.queryByText('Please enter a value.')).not.toBeInTheDocument()
      expect(screen.getByTestId('value').closest('[data-testid="input"]')).toHaveClass('input--error')
      expect(screen.getByTestId('value')).toHaveFocus()
    })
    expect(mockCreateService).not.toHaveBeenCalled()
  })

  it('should open invalid environment variables before handling earlier validation errors', async () => {
    const { userEvent } = renderConfiguration({
      variablesSeed: [
        {
          variable: 'INCIDENT_API_KEY',
          value: '',
          scope: 'AGENTIC_WORKFLOW',
          isSecret: true,
        },
      ],
    })

    const variablesTrigger = screen.getByRole('button', { name: /Environment variables/ })
    await userEvent.click(variablesTrigger)
    expect(variablesTrigger).toHaveAttribute('data-state', 'closed')

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(variablesTrigger).toHaveAttribute('data-state', 'open')
      expect(screen.getByTestId('value').closest('[data-testid="input"]')).toHaveClass('input--error')
    })
    expect(screen.getByText('Please enter an agent task name.')).toBeInTheDocument()
  })

  it('should focus the variable row when its invalid field has no text input', async () => {
    const { userEvent } = renderConfiguration({
      seed: validSeed,
      variablesSeed: [
        {
          variable: 'CONFIG_FILE',
          value: '',
          scope: 'AGENTIC_WORKFLOW',
          isSecret: false,
          file: { path: '/tmp/config.json' },
        },
      ],
    })

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(screen.getByTestId('variable-row')).toHaveFocus())
  })

  it('should create the agent task when Create is clicked', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'review-agent')
    await userEvent.type(screen.getByRole('textbox', { name: 'Instructions' }), 'Review incoming payloads.')
    await userEvent.click(screen.getByRole('button', { name: 'Add provider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select stored token' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add trigger' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'From a webhook' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(mockCreateService).toHaveBeenCalledTimes(1))
    expect(mockCreateService).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ enabled: true, execution_mode: AgenticWorkflowExecutionMode.IN_PLACE }),
      })
    )
    expect(posthog.capture).toHaveBeenCalledWith('agent-task-form-submitted', { success: true })
  })

  it('should track a failed agent task creation', async () => {
    mockCreateService.mockRejectedValueOnce(new Error('Creation failed'))
    const { userEvent } = renderConfiguration({ seed: validSeed })

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(posthog.capture).toHaveBeenCalledWith('agent-task-form-submitted', { success: false }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

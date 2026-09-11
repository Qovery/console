import posthog from 'posthog-js'
import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow, type AgenticWorkflowFormData } from '../agentic-workflow-context'
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

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1', environmentId: 'environment-1' }),
}))

jest.mock('posthog-js', () => ({ capture: jest.fn() }))

jest.mock('../../../hooks/use-create-service/use-create-service', () => ({
  useCreateService: () => ({ isLoading: false, mutateAsync: mockCreateService }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  GitBranchSettings: () => <div>Git branch</div>,
  GitProviderSetting: () => <div>Git provider</div>,
  GitRepositorySetting: () => <div>Git repository</div>,
  McpServerCreateEditModal: () => <div>Create MCP server</div>,
  McpServerSetting: () => <div>Organization MCP connectors</div>,
  useMcpServers: () => ({ data: [], isLoading: false }),
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
}: {
  onExit?: () => void
  seed?: Partial<AgenticWorkflowFormData>
  variablesSeed?: Parameters<typeof AgenticWorkflowCreationFlow>[0]['variablesSeed']
} = {}) {
  return renderWithProviders(
    <AgenticWorkflowCreationFlow onExit={onExit} seed={seed} variablesSeed={variablesSeed}>
      <AgenticWorkflowConfiguration />
    </AgenticWorkflowCreationFlow>
  )
}

const validSeed: Partial<AgenticWorkflowFormData> = {
  name: 'review-agent',
  agentPrompt: 'Review incoming payloads.',
  modelApiKey: 'sk-ant-test',
  automations: [{ id: 'automation-1', triggers: [{ id: 'webhook-1', type: 'webhook' }], outputs: [] }],
}

describe('AgenticWorkflowConfiguration validation', () => {
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

    await userEvent.click(screen.getByRole('button', { name: /Add from Git repository/ }))
    expect(screen.getByRole('heading', { name: 'Add from Git repository' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    expect(screen.getByRole('heading', { name: 'Configure provider' })).toBeInTheDocument()
    expect(screen.getByLabelText('API key')).toBeInTheDocument()
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

  it('should manage MCP from a side panel', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    expect(screen.getByRole('heading', { name: 'Manage MCP' })).toBeInTheDocument()
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

    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    await userEvent.type(screen.getByLabelText('API key'), 'sk-ant-test')
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))

    expect(createButton).toBeEnabled()

    await userEvent.click(createButton)

    expect(screen.getByText('Trigger required')).toHaveClass('text-negative')
    expect(screen.getByRole('heading', { name: 'Configure triggers' })).toBeInTheDocument()
    expect(screen.getByText('At least one trigger is required.')).toBeInTheDocument()
    expect(screen.getByTestId('trigger-validation')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled()
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
    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    await userEvent.type(screen.getByLabelText('API key'), 'sk-ant-test')
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

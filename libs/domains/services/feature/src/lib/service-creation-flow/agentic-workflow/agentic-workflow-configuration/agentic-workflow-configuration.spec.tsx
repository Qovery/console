import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AgenticWorkflowCreationFlow } from '../agentic-workflow-context'
import {
  AgenticWorkflowConfiguration,
  areVariablesValid,
  getJsonError,
  isGitRepositoryComplete,
  isOutputComplete,
} from './agentic-workflow-configuration'

const mockNavigate = jest.fn()
const mockCreateService = jest.fn()
const mockDeployEnvironment = jest.fn()
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

jest.mock('../../../hooks/use-deploy-environment/use-deploy-environment', () => ({
  useDeployEnvironment: () => ({ isLoading: false, mutateAsync: mockDeployEnvironment }),
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
  TextAreaVariableSuggestion: jest.requireActual('react').forwardRef<
    HTMLTextAreaElement,
    {
      autoFocus?: boolean
      error?: string
      label: string
      name: string
      onChange: (value: string) => void
      placeholder?: string
      value: string
    }
  >(function TextAreaVariableSuggestion({ autoFocus, error, label, name, onChange, placeholder, value }, ref) {
    return (
      <label>
        {label}
        <textarea
          ref={ref}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {error}
      </label>
    )
  }),
  VariableRow: () => <div>Variable</div>,
  useImportVariables: () => ({ isLoading: false, mutateAsync: mockImportVariables }),
}))

jest.mock('../agentic-workflow-schedule-fields', () => ({
  ...jest.requireActual('../agentic-workflow-schedule-fields'),
  AgenticWorkflowScheduleFields: () => <div>Schedule</div>,
}))

function renderConfiguration(onExit = jest.fn()) {
  return renderWithProviders(
    <AgenticWorkflowCreationFlow onExit={onExit}>
      <AgenticWorkflowConfiguration />
    </AgenticWorkflowCreationFlow>
  )
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

  it('should require a webhook URL for configured output webhooks', () => {
    expect(isOutputComplete({ url: 'https://hooks.example.com/workflow', headersJson: '{}', prompt: '' })).toBe(true)
    expect(isOutputComplete({ url: '', headersJson: '{}', prompt: 'Notify the team.' })).toBe(false)
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
})

describe('AgenticWorkflowConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateService.mockResolvedValue({ id: 'workflow-1' })
    mockDeployEnvironment.mockResolvedValue(undefined)
    mockImportVariables.mockResolvedValue(undefined)
  })

  it('should place the name before the prompt without forcing initial focus', () => {
    renderConfiguration()

    const name = screen.getByRole('textbox', { name: 'Name' })
    const prompt = screen.getByRole('textbox', { name: 'Instructions' })

    expect(name.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(prompt).not.toHaveFocus()
    expect(screen.getByPlaceholderText('New agent task')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe the agent task behavior.')).toBeInTheDocument()
    expect(screen.queryByTestId('progress-bar-wrapper')).not.toBeInTheDocument()
  })

  it('should leave the creation page from the top-left back action', async () => {
    const onExit = jest.fn()
    const { userEvent } = renderConfiguration(onExit)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('should group the Dockerfile fragment and governance under advanced settings', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Advanced settings/ }))

    expect(screen.getByRole('heading', { name: 'Dockerfile fragment' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Governance' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Domain allowlist' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Governance/ })).not.toBeInTheDocument()
  })

  it('should configure context, provider, and automations from the main canvas', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: /Add from Git repository/ }))
    expect(screen.getByRole('heading', { name: 'Add from Git repository' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    expect(screen.getByRole('heading', { name: 'Configure provider' })).toBeInTheDocument()
    expect(screen.getByLabelText('API key')).toBeInTheDocument()
    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))

    await userEvent.click(screen.getByRole('button', { name: 'Add automation' }))
    expect(screen.getByRole('heading', { name: 'Configure automation' })).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })

  it('should surface validation feedback when a creation action is clicked with incomplete configuration', async () => {
    const { userEvent } = renderConfiguration()
    const createButton = screen.getByRole('button', { name: 'Create' })
    const createAndDeployButton = screen.getByRole('button', { name: 'Create and deploy' })

    expect(createButton).toBeEnabled()
    expect(createAndDeployButton).toBeEnabled()

    await userEvent.click(createButton)
    expect(screen.getByText('Please enter an agent task name.')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'review-agent')
    await userEvent.type(screen.getByRole('textbox', { name: /Instructions/ }), 'Review incoming payloads.')

    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    await userEvent.type(screen.getByLabelText('API key'), 'sk-ant-test')
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))

    expect(createButton).toBeEnabled()
    expect(createAndDeployButton).toBeEnabled()
  })

  it('should create without deploying when Create is clicked', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'review-agent')
    await userEvent.type(screen.getByRole('textbox', { name: 'Instructions' }), 'Review incoming payloads.')
    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    await userEvent.type(screen.getByLabelText('API key'), 'sk-ant-test')
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(mockCreateService).toHaveBeenCalledTimes(1))
    expect(mockCreateService).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ execution_mode: AgenticWorkflowExecutionMode.IN_PLACE }),
      })
    )
    expect(mockDeployEnvironment).not.toHaveBeenCalled()
  })

  it('should deploy the created agent task when Create and deploy is clicked', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'review-agent')
    await userEvent.type(screen.getByRole('textbox', { name: 'Instructions' }), 'Review incoming payloads.')
    await userEvent.click(screen.getByRole('button', { name: 'Anthropic' }))
    await userEvent.type(screen.getByLabelText('API key'), 'sk-ant-test')
    await userEvent.click(screen.getByRole('button', { name: 'Save provider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create and deploy' }))

    await waitFor(() => expect(mockDeployEnvironment).toHaveBeenCalledWith({ environmentId: 'environment-1' }))
  })
})

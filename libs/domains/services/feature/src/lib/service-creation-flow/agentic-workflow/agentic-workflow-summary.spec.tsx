import { useLayoutEffect, useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  AgenticWorkflowCreationFlow,
  type AgenticWorkflowFormData,
  useAgenticWorkflowCreateContext,
} from './agentic-workflow-context'
import { AgenticWorkflowSummary } from './agentic-workflow-summary'

const mockNavigate = jest.fn()
const mockCreateService = jest.fn()
const mockImportVariables = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'project-1',
    environmentId: 'environment-1',
  }),
}))

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

jest.mock('../../hooks/use-create-service/use-create-service', () => ({
  ...jest.requireActual('../../hooks/use-create-service/use-create-service'),
  useCreateService: () => ({
    isLoading: false,
    mutateAsync: mockCreateService,
  }),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  useImportVariables: () => ({
    isLoading: false,
    mutateAsync: mockImportVariables,
  }),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  useMcpServers: () => ({
    data: [
      { id: 'mcp-1', name: 'Documentation' },
      { id: 'mcp-2', name: 'Tickets' },
    ],
  }),
}))

const validValues: Partial<AgenticWorkflowFormData> = {
  name: 'review-agent',
  description: 'Reviews incoming changes',
  modelApiKey: 'sk-ant-test',
  agentPrompt: 'Review payloads and open pull requests.',
  whitelistHosts: '*',
  mcpJson: '{"mcpServers":{"costory":{"type":"http","url":"https://app-api.costory.io/mcp"}}}',
  mcpServerIds: ['mcp-1', 'mcp-2'],
  outputs: [{ url: 'https://hooks.example.com/workflow', headersJson: '{}', prompt: 'Notify the team.' }],
}

function WithFormValues({
  children,
  values = validValues,
}: {
  children: JSX.Element
  values?: Partial<AgenticWorkflowFormData>
}) {
  const { form } = useAgenticWorkflowCreateContext()
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    form.reset({
      ...form.getValues(),
      ...values,
    })
    setReady(true)
  }, [form, values])

  if (!ready) {
    return null
  }

  return children
}

function renderSummary(values?: Partial<AgenticWorkflowFormData>) {
  return renderWithProviders(
    <AgenticWorkflowCreationFlow creationFlowUrl="/create/agentic-workflow" onExit={jest.fn()}>
      <WithFormValues values={values}>
        <AgenticWorkflowSummary />
      </WithFormValues>
    </AgenticWorkflowCreationFlow>
  )
}

describe('AgenticWorkflowSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockCreateService.mockResolvedValue({ id: 'workflow-1' })
    mockImportVariables.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render configured values from the configuration form', () => {
    renderSummary({
      ...validValues,
      gitRepositories: [
        {
          provider: 'GITHUB',
          repository: 'Qovery/console',
          branch: 'staging',
        },
      ],
    })

    expect(screen.getByText('review-agent')).toBeInTheDocument()
    expect(screen.getByText('Reviews incoming changes')).toBeInTheDocument()
    expect(screen.getByText('********')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText(validValues.mcpJson ?? '')).toBeInTheDocument()
    expect(screen.getByText('Documentation, Tickets')).toBeInTheDocument()
    expect(screen.getByText('1 webhook')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Schedule' })).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/create/agentic-workflow/configuration' })
  })

  it('should navigate back to the edited section from summary', async () => {
    const { userEvent } = renderSummary()

    await userEvent.click(screen.getByRole('button', { name: 'Edit AI model' }))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/create/agentic-workflow/configuration' })
  })

  it('should redirect an invalid enabled schedule back to configuration', () => {
    renderSummary({
      scheduleEnabled: true,
      scheduleCronExpression: 'invalid',
    })

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/create/agentic-workflow/configuration' })
  })

  it('should create the agentic workflow and navigate back to the environment overview', async () => {
    const { userEvent } = renderSummary()

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(mockCreateService).toHaveBeenCalledWith({
      environmentId: 'environment-1',
      payload: expect.objectContaining({
        serviceType: 'AGENTIC_WORKFLOW',
        name: 'review-agent',
        mcp: validValues.mcpJson,
        mcp_server_ids: ['mcp-1', 'mcp-2'],
        outputs: [expect.objectContaining({ url: 'https://hooks.example.com/workflow' })],
      }),
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: { organizationId: 'org-1', projectId: 'project-1', environmentId: 'environment-1' },
    })
  })

  it('should import configured environment variables after creating the agentic workflow', async () => {
    function WithVariables() {
      const { variablesForm } = useAgenticWorkflowCreateContext()

      useLayoutEffect(() => {
        variablesForm.reset({
          variables: [
            { variable: 'API_URL', value: 'https://api.example.com', scope: 'AGENTIC_WORKFLOW', isSecret: false },
          ],
          externalSecrets: [],
        })
      }, [variablesForm])

      return null
    }

    const { userEvent } = renderWithProviders(
      <AgenticWorkflowCreationFlow creationFlowUrl="/create/agentic-workflow" onExit={jest.fn()}>
        <WithVariables />
        <WithFormValues>
          <AgenticWorkflowSummary />
        </WithFormValues>
      </AgenticWorkflowCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(mockImportVariables).toHaveBeenCalledWith({
      serviceId: 'workflow-1',
      serviceType: 'AGENTIC_WORKFLOW',
      variableImportRequest: {
        overwrite: true,
        vars: [{ name: 'API_URL', value: 'https://api.example.com', scope: 'AGENTIC_WORKFLOW', is_secret: false }],
      },
    })
  })

  it('should retry importing variables without creating a duplicate agentic workflow', async () => {
    function WithVariables() {
      const { variablesForm } = useAgenticWorkflowCreateContext()

      useLayoutEffect(() => {
        variablesForm.reset({
          variables: [
            { variable: 'API_URL', value: 'https://api.example.com', scope: 'AGENTIC_WORKFLOW', isSecret: false },
          ],
          externalSecrets: [],
        })
      }, [variablesForm])

      return null
    }

    mockImportVariables.mockRejectedValueOnce(new Error('Import failed')).mockResolvedValueOnce(undefined)

    const { userEvent } = renderWithProviders(
      <AgenticWorkflowCreationFlow creationFlowUrl="/create/agentic-workflow" onExit={jest.fn()}>
        <WithVariables />
        <WithFormValues>
          <AgenticWorkflowSummary />
        </WithFormValues>
      </AgenticWorkflowCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(mockCreateService).toHaveBeenCalledTimes(1)
    expect(mockImportVariables).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: { organizationId: 'org-1', projectId: 'project-1', environmentId: 'environment-1' },
    })
  })
})

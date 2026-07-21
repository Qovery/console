import { useLayoutEffect, useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  AgenticWorkflowCreationFlow,
  type AgenticWorkflowFormData,
  useAgenticWorkflowCreateContext,
} from './agentic-workflow-context'
import { AgenticWorkflowSummary } from './agentic-workflow-summary'

const mockNavigate = jest.fn()
const mockCreateAgenticWorkflow = jest.fn()

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

jest.mock('./hooks/use-create-agentic-workflow/use-create-agentic-workflow', () => ({
  ...jest.requireActual('./hooks/use-create-agentic-workflow/use-create-agentic-workflow'),
  useCreateAgenticWorkflow: () => ({
    isLoading: false,
    mutateAsync: mockCreateAgenticWorkflow,
  }),
}))

const validValues: Partial<AgenticWorkflowFormData> = {
  name: 'review-agent',
  description: 'Reviews incoming changes',
  modelApiKey: 'sk-ant-test',
  agentPrompt: 'Review payloads and open pull requests.',
  whitelistHosts: '*',
  mcpJson: '{"mcpServers":{"costory":{"type":"http","url":"https://app-api.costory.io/mcp"}}}',
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
    mockCreateAgenticWorkflow.mockResolvedValue({ id: 'workflow-1' })
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
    expect(screen.getByText('1 webhook')).toBeInTheDocument()
  })

  it('should navigate back to the edited section from summary', async () => {
    const { userEvent } = renderSummary()

    await userEvent.click(screen.getByRole('button', { name: 'Edit AI model' }))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/create/agentic-workflow/configuration' })
  })

  it('should create the agentic workflow and navigate back to the environment overview', async () => {
    const { userEvent } = renderSummary()

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(mockCreateAgenticWorkflow).toHaveBeenCalledWith({
      environmentId: 'environment-1',
      payload: expect.objectContaining({
        name: 'review-agent',
        mcp: validValues.mcpJson,
        outputs: [expect.objectContaining({ url: 'https://hooks.example.com/workflow' })],
      }),
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: { organizationId: 'org-1', projectId: 'project-1', environmentId: 'environment-1' },
    })
  })
})

import posthog from 'posthog-js'
import { type Environment } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentAutomation } from './environment-automation'

const mockServices = jest.fn()
const mockNavigate = jest.fn()
const mockOpenModal = jest.fn()
let mockEnabled = true
const environment = { id: 'env', cloud_provider: { provider: 'AWS' } } as Environment
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: jest
    .requireActual('react')
    .forwardRef(
      (
        {
          children,
          to,
          search,
          params = {},
          ...props
        }: { children: ReactNode; to: string; search?: Record<string, string>; params?: Record<string, string> },
        ref: React.Ref<HTMLAnchorElement>
      ) => (
        <a
          ref={ref}
          {...props}
          href={
            Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to) +
            (search ? '?' + new URLSearchParams(search).toString() : '')
          }
        >
          {children}
        </a>
      )
    ),
  useParams: () => ({ organizationId: 'org', projectId: 'project', environmentId: 'env' }),
  useNavigate: () => mockNavigate,
}))
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: () => mockEnabled }))
jest.mock('posthog-js', () => ({ capture: jest.fn() }))
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({ openModal: mockOpenModal, closeModal: jest.fn() }),
}))
jest.mock('../hooks/use-services/use-services', () => ({ useServices: () => mockServices() }))
jest.mock('./agentic-workflow-service-list', () => ({
  AgenticWorkflowServiceList: ({ cloneTasks }: { cloneTasks?: boolean }) => (
    <div>{cloneTasks ? 'Clone table' : 'Agent table'}</div>
  ),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockEnabled = true
  mockServices.mockReturnValue({ data: [] })
})

it('shows categorized templates and scratch creation when no agent exists', async () => {
  const { userEvent } = renderWithProviders(<EnvironmentAutomation environment={environment} />)
  for (const category of ['Coding Agent', 'Incident Analyzer', 'Optimization']) {
    expect(screen.getByRole('heading', { name: category })).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: /Slack Coding Agent/i })).toHaveAttribute(
    'href',
    '/organization/org/project/project/environment/env/service/create/agentic-workflow?template=slack-coding-agent'
  )
  expect(screen.getByRole('link', { name: /Sentry Incident Analyzer/i })).toBeInTheDocument()
  expect(screen.queryByText('Agent table')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Start from scratch' }))
  expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ search: {} }))
  expect(posthog.capture).toHaveBeenCalledWith('select-agent-use-case', { agentUseCase: 'from-scratch' })
})

it('shows tables and categorized creation dropdown when agents exist', async () => {
  mockServices.mockReturnValue({ data: [{ service_type: 'AGENTIC_WORKFLOW', serviceType: 'AGENTIC_WORKFLOW' }] })
  const { userEvent } = renderWithProviders(<EnvironmentAutomation environment={environment} />)
  expect(screen.getByText('Agent table')).toBeInTheDocument()
  expect(screen.queryByText('Clone table')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Slack Coding Agent/i })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Create agent task' }))
  const item = await screen.findByRole('menuitem', { name: 'Sentry Incident Analyzer' })
  await userEvent.click(item)
  expect(item).toHaveAttribute(
    'href',
    '/organization/org/project/project/environment/env/service/create/agentic-workflow?template=sentry-incident-analyzer'
  )
  expect(posthog.capture).toHaveBeenCalledWith('select-agent-use-case', { agentUseCase: 'sentry-incident-analyzer' })
})

it('opens the existing template request modal', async () => {
  const { userEvent } = renderWithProviders(<EnvironmentAutomation environment={environment} />)
  await userEvent.click(screen.getByRole('button', { name: 'Request agent template' }))
  expect(mockOpenModal).toHaveBeenCalledWith({ content: expect.anything() })
})

it('hides Automation when the feature flag is disabled', () => {
  mockEnabled = false
  renderWithProviders(<EnvironmentAutomation environment={environment} />)
  expect(screen.queryByRole('heading', { name: 'Automation' })).not.toBeInTheDocument()
})

it('places cloned environment previews after the agent table', () => {
  mockServices.mockReturnValue({ data: [{ service_type: 'AGENTIC_WORKFLOW', serviceType: 'AGENTIC_WORKFLOW' }] })
  renderWithProviders(<EnvironmentAutomation environment={environment} previews={<div>Environment previews</div>} />)
  expect(
    screen.getByText('Agent table').compareDocumentPosition(screen.getByText('Environment previews')) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy()
})

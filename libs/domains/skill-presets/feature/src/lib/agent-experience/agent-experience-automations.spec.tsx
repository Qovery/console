import { useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { BillingApi, type Gate } from 'qovery-pricing-typescript-axios'
import { type ServiceLightResponse, ServiceTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { AgentExperienceAutomations } from './agent-experience-automate'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockNavigate = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({ openModal: mockOpenModal, closeModal: mockCloseModal }),
}))

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
  Navigate: ({ to }: { to: string }) => <div data-testid="redirect">{to}</div>,
  Link: ({ children, to, params }: { children: ReactNode; to: string; params: Record<string, string> }) => (
    <a href={to.replace(/\$(\w+)/g, (_, key) => params[key])}>{children}</a>
  ),
}))

const organizationId = 'organization-1'
const task: ServiceLightResponse = {
  id: 'task-1',
  name: 'Daily report',
  description: '',
  icon_uri: '',
  service_type: ServiceTypeEnum.AGENTIC_WORKFLOW,
  project_id: 'project-1',
  project_name: 'Reporting',
  environment_id: 'env-1',
  environment_name: 'Staging',
  cluster_id: 'cluster-1',
}

const mockServices = jest.fn<Promise<ServiceLightResponse[]>, []>()
// The billing-paywall flag (off by default) and the gates pricing-api answers when it is on.
const mockBillingFlag = jest.fn(() => false)
const mockGates: { current: Gate[] } = { current: [] }
const mockGatesCall = jest.fn()

const lockedAgentTasks: Gate = {
  action: 'agent_task.create',
  sku: 'agents',
  name: 'Agent tasks',
  allowed: false,
  reason: 'not_in_plan',
  limit: false,
  used: 0,
  requested: 1,
  paywall: {
    sku: 'agents',
    title: 'Agent tasks',
    message: 'Agent tasks is not included in your Starter plan.',
    headline: 'Hand recurring jobs to AI agents that run in your environments.',
    benefits: [],
    audience: 'billing',
    options: [
      {
        type: 'addon',
        label: 'Add Agent tasks',
        addon: 'agents',
        addon_name: 'Agent tasks',
        amount: 10000,
        currency: 'USD',
        period: 'month',
      },
      { type: 'upgrade', label: 'Move to Growth', plan: 'GROWTH_2026', plan_name: 'Growth' },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useParams).mockReturnValue({ organizationId })
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  jest
    .mocked(useFeatureFlagEnabled)
    .mockImplementation((flag: string) => (flag === 'billing-paywall' ? mockBillingFlag() : true))
  mockBillingFlag.mockReturnValue(false)
  mockGates.current = []
  jest.spyOn(BillingApi.prototype, 'gates').mockImplementation(async (request) => {
    mockGatesCall(request)
    return { data: { gates: mockGates.current }, status: 200 } as Awaited<ReturnType<BillingApi['gates']>>
  })
  jest
    .spyOn(BillingApi.prototype, 'gateIntro')
    .mockResolvedValue({ status: 204 } as Awaited<ReturnType<BillingApi['gateIntro']>>)
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: true, isLoading: false })
  mockServices.mockResolvedValue([
    task,
    { ...task, id: 'app', name: 'Web app', service_type: ServiceTypeEnum.APPLICATION },
    { ...task, id: 'task-2', name: 'Weekly report', environment_id: 'env-2', environment_name: 'Production' },
  ])
  const servicesSearch = queries.organizations.servicesSearch({ organizationId })
  jest.spyOn(queries.organizations, 'servicesSearch').mockReturnValue({ ...servicesSearch, queryFn: mockServices })
})

afterEach(() => {
  jest.restoreAllMocks()
})

it('links to the agent task and shows its project and environment as text', async () => {
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  expect(screen.getByRole('button', { name: 'Need help here?' })).toBeInTheDocument()
  expect(await screen.findByRole('link', { name: task.name })).toHaveAttribute(
    'href',
    '/organization/organization-1/project/project-1/environment/env-1/service/task-1/overview'
  )
  const dailyReport = screen.getByRole('row', { name: /Daily report/ })
  expect(within(dailyReport).getByRole('cell', { name: 'Reporting' })).toBeInTheDocument()
  expect(within(dailyReport).getByRole('cell', { name: 'Staging' })).toBeInTheDocument()
  expect(within(dailyReport).getAllByRole('link')).toHaveLength(1)
  expect(
    within(screen.getByRole('row', { name: /Weekly report/ })).getByRole('cell', { name: 'Production' })
  ).toBeInTheDocument()
  expect(screen.getAllByRole('link')).toHaveLength(2)
  expect(screen.queryByText('Web app')).not.toBeInTheDocument()
  expect(mockServices).toHaveBeenCalledTimes(1)
  await userEvent.click(within(dailyReport).getByRole('cell', { name: 'Staging' }))
  expect(mockNavigate).toHaveBeenCalledWith({
    to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
    params: { organizationId, projectId: 'project-1', environmentId: 'env-1', serviceId: 'task-1' },
  })
})

it('sends creation to the existing environment picker', async () => {
  mockServices.mockResolvedValue([])
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  expect(await screen.findByText('No agent tasks yet')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Create agent task' }))
  expect(mockOpenModal).toHaveBeenCalledWith({
    content: expect.objectContaining({ props: { organizationId, onClose: mockCloseModal } }),
  })
  expect(mockGatesCall).not.toHaveBeenCalled()
})

it('opens the full-page paywall instead of the picker when agent tasks are not in the plan', async () => {
  mockBillingFlag.mockReturnValue(true)
  mockGates.current = [lockedAgentTasks]
  mockServices.mockResolvedValue([])
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  expect(await screen.findByText('No agent tasks yet')).toBeInTheDocument()
  await screen.findByRole('button', { name: 'Create agent task' })
  await waitFor(() =>
    expect(mockGatesCall).toHaveBeenCalledWith(expect.objectContaining({ actions: 'agent_task.create' }))
  )
  await userEvent.click(screen.getByRole('button', { name: 'Create agent task' }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Agent tasks' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add agent tasks for $100/month' })).toBeInTheDocument()
  expect(mockOpenModal).not.toHaveBeenCalled()
})

it('shows the intro first when agent tasks are in the plan, then Continue opens the picker', async () => {
  mockBillingFlag.mockReturnValue(true)
  mockGates.current = [
    {
      ...lockedAgentTasks,
      allowed: true,
      reason: '',
      paywall: undefined,
      intro: {
        sku: 'agents',
        title: 'Agent tasks',
        headline: 'Included in your plan',
        benefits: ['Runs on a schedule, a webhook or by hand'],
        plan: { code: 'GROWTH_2026', name: 'Growth' },
        cta: 'Continue',
      },
    },
  ]
  mockServices.mockResolvedValue([])
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  await screen.findByText('No agent tasks yet')
  await waitFor(() => expect(mockGatesCall).toHaveBeenCalled())
  await userEvent.click(screen.getByRole('button', { name: 'Create agent task' }))
  expect(await screen.findByText('Included in your Growth plan')).toBeInTheDocument()
  expect(mockOpenModal).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
  expect(mockOpenModal).toHaveBeenCalledWith({
    content: expect.objectContaining({ props: { organizationId, onClose: mockCloseModal } }),
  })
})

it('keeps the list read-only for members', async () => {
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: false, isLoading: false })
  renderWithProviders(<AgentExperienceAutomations />)
  expect(await screen.findByRole('link', { name: task.name })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Create agent task' })).not.toBeInTheDocument()
})

it('retries a failed organization services request', async () => {
  mockServices.mockRejectedValueOnce(new Error('Unavailable'))
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  expect(await screen.findByText('Agent tasks could not be loaded')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByRole('link', { name: task.name })).toBeInTheDocument()
})

it('redirects to the Skills Registry with the feature flag off', () => {
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  renderWithProviders(<AgentExperienceAutomations />)
  expect(screen.getByTestId('redirect')).toHaveTextContent('/organization/$organizationId/agents/skill-presets')
  expect(mockServices).not.toHaveBeenCalled()
})

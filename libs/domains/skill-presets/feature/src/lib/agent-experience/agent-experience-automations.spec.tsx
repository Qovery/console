import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ServiceLightResponse, ServiceTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { AgentExperienceAutomations } from './agent-experience-automate'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({ openModal: mockOpenModal, closeModal: mockCloseModal }),
}))

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
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

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useParams).mockReturnValue({ organizationId })
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
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

it('lists only agent tasks, with links to their projects, environments and services', async () => {
  renderWithProviders(<AgentExperienceAutomations />)
  expect(screen.getByRole('button', { name: 'Need help here?' })).toBeInTheDocument()
  expect(await screen.findByRole('link', { name: task.name })).toHaveAttribute(
    'href',
    '/organization/organization-1/project/project-1/environment/env-1/service/task-1/overview'
  )
  expect(screen.getByRole('link', { name: 'Staging' })).toHaveAttribute(
    'href',
    '/organization/organization-1/project/project-1/environment/env-1/overview'
  )
  expect(screen.getByRole('link', { name: 'Production' })).toHaveAttribute(
    'href',
    '/organization/organization-1/project/project-1/environment/env-2/overview'
  )
  const projectLinks = screen.getAllByRole('link', { name: 'Reporting' })
  expect(projectLinks).toHaveLength(2)
  projectLinks.forEach((link) =>
    expect(link).toHaveAttribute('href', '/organization/organization-1/project/project-1/overview')
  )
  expect(screen.queryByText('Web app')).not.toBeInTheDocument()
  expect(mockServices).toHaveBeenCalledTimes(1)
})

it('sends creation to the existing environment picker', async () => {
  mockServices.mockResolvedValue([])
  const { userEvent } = renderWithProviders(<AgentExperienceAutomations />)
  expect(await screen.findByText('No agent tasks yet')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Create agent task' }))
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
  expect(screen.getByTestId('redirect')).toHaveTextContent(
    '/organization/$organizationId/agent-experience/skill-presets'
  )
  expect(mockServices).not.toHaveBeenCalled()
})

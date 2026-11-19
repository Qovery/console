import selectEvent from 'react-select-event'
import { AGENTIC_WORKFLOW_TEMPLATES } from '@qovery/domains/services/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AgentTaskEnvironmentModal } from './agent-task-environment-modal'

const mockNavigate = jest.fn()
const mockEnvironments = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => mockEnvironments(),
}))
jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useProjects: () => ({
    data: [
      { id: 'p1', name: 'Project one' },
      { id: 'p2', name: 'Project two' },
    ],
    isLoading: false,
  }),
}))

const props = { organizationId: 'org', template: AGENTIC_WORKFLOW_TEMPLATES[0], onClose: jest.fn() }
const select = async (label: string, value: string) =>
  selectEvent.select(screen.getByLabelText(label), value, { container: document.body })

beforeEach(() => {
  jest.clearAllMocks()
  mockEnvironments.mockReturnValue({ data: [{ id: 'env', name: 'Staging' }], isFetching: false, isError: false })
})

it('opens the selected template creation flow in the chosen environment', async () => {
  const { userEvent } = renderWithProviders(<AgentTaskEnvironmentModal {...props} />)
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  await select('Project', 'Project one')
  await select('Environment', 'Staging')
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow',
      params: { organizationId: 'org', projectId: 'p1', environmentId: 'env' },
      search: { template: props.template.id },
    })
  )
  expect(props.onClose).toHaveBeenCalled()
})

it('clears the environment when switching projects', async () => {
  renderWithProviders(<AgentTaskEnvironmentModal {...props} />)
  await select('Project', 'Project one')
  await select('Environment', 'Staging')
  await select('Project', 'Project two')
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})

it.each([
  [{ data: [], isFetching: false, isError: false }, 'This project has no environments.'],
  [{ data: [], isFetching: false, isError: true }, 'Unable to load environments.'],
])('prevents continuing when environments are unavailable', async (result, message) => {
  mockEnvironments.mockReturnValue(result)
  renderWithProviders(<AgentTaskEnvironmentModal {...props} />)
  await select('Project', 'Project one')
  expect(screen.getByText(new RegExp(message))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})

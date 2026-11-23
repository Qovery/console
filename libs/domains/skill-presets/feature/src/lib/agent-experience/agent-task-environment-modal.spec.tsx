import selectEvent from 'react-select-event'
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

const props = { organizationId: 'org', onClose: jest.fn() }
const select = async (label: string, value: string) =>
  selectEvent.select(screen.getByLabelText(label), value, { container: document.body })

beforeEach(() => {
  jest.clearAllMocks()
  mockEnvironments.mockReturnValue({ data: [{ id: 'env', name: 'Staging' }], isFetching: false, isError: false })
})

it('clears the environment when switching projects', async () => {
  renderWithProviders(<AgentTaskEnvironmentModal {...props} />)
  await select('Project', 'Project one')
  await select('Environment', 'Staging')
  await select('Project', 'Project two')
  expect(screen.getByRole('button', { name: 'Open Automations' })).toBeDisabled()
})

it.each([
  [{ data: [], isFetching: false, isError: false }, 'This project has no environments.'],
  [{ data: [], isFetching: false, isError: true }, 'Unable to load environments.'],
])('prevents continuing when environments are unavailable', async (result, message) => {
  mockEnvironments.mockReturnValue(result)
  renderWithProviders(<AgentTaskEnvironmentModal {...props} />)
  await select('Project', 'Project one')
  expect(screen.getByText(new RegExp(message))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open Automations' })).toBeDisabled()
})

it('opens Automations in the chosen environment without a template', async () => {
  const { userEvent } = renderWithProviders(<AgentTaskEnvironmentModal organizationId="org" onClose={props.onClose} />)
  await select('Project', 'Project one')
  await select('Environment', 'Staging')
  await userEvent.click(screen.getByRole('button', { name: 'Open Automations' }))
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/automation',
      params: { organizationId: 'org', projectId: 'p1', environmentId: 'env' },
    })
  )
  expect(props.onClose).toHaveBeenCalled()
})

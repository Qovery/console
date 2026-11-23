import { useState } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { AgentTaskEnvironmentModal } from './agent-task-environment-modal'

const mockNavigate = jest.fn()
const mockEnvironments = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: (options: unknown) => mockEnvironments(options),
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
  expect(mockEnvironments).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }))
  await select('Project', 'Project one')
  expect(mockEnvironments).toHaveBeenLastCalledWith(
    expect.objectContaining({ enabled: true, queryKey: queries.environments.list({ projectId: 'p1' }).queryKey })
  )
  await select('Environment', 'Staging')
  await select('Project', 'Project two')
  expect(mockEnvironments).toHaveBeenLastCalledWith(
    expect.objectContaining({ enabled: true, queryKey: queries.environments.list({ projectId: 'p2' }).queryKey })
  )
  expect(screen.getByRole('button', { name: 'Open Automations' })).toBeDisabled()
})

it.each([
  [{ data: [], isFetching: false, isError: false }, 'This project has no environments.'],
  [{ data: undefined, isFetching: false, isError: true }, 'Unable to load environments.'],
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

it('keeps the selected environment available after a background refetch fails', async () => {
  const refetch = jest.fn()

  function ModalWithRefetch() {
    const [refetchFailed, setRefetchFailed] = useState(false)
    mockEnvironments.mockReturnValue({
      data: [{ id: 'env', name: 'Staging' }],
      isFetching: false,
      isError: refetchFailed,
      refetch,
    })
    return (
      <>
        <button type="button" onClick={() => setRefetchFailed(true)}>
          Fail refetch
        </button>
        <AgentTaskEnvironmentModal {...props} />
      </>
    )
  }

  const { userEvent } = renderWithProviders(<ModalWithRefetch />)
  await select('Project', 'Project one')
  await select('Environment', 'Staging')
  await userEvent.click(screen.getByRole('button', { name: 'Fail refetch' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to refresh environments.')
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(refetch).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: 'Open Automations' }))
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1))
})

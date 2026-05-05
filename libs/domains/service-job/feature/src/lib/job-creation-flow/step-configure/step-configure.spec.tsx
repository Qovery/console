import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { JobCreationFlow } from '../job-creation-flow'
import { StepConfigure } from './step-configure'

let mockPathname = '/'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => jest.fn(),
  useSearch: () => jest.fn(),
  useLocation: () => ({ pathname: mockPathname, search: '' }),
}))

describe('Configure', () => {
  beforeEach(() => {
    mockPathname = '/'
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <JobCreationFlow creationFlowUrl={mockPathname}>
        <StepConfigure />
      </JobCreationFlow>
    )
    expect(baseElement).toBeTruthy()
  })

  it('for a cron job, with these defaultValues submit button should be enabled', async () => {
    mockPathname = '/cron'

    const { userEvent } = renderWithProviders(
      <JobCreationFlow creationFlowUrl={mockPathname}>
        <StepConfigure />
      </JobCreationFlow>
    )

    const submitButton = await screen.findByRole('button', { name: /Continue/i })
    expect(submitButton).toBeInTheDocument()

    const scheduleInput = await screen.findByLabelText('Schedule - Cron expression')
    await userEvent.type(scheduleInput, '0 0 * * *')

    const nbRestartsInput = screen.getByLabelText('Number of restarts')
    await userEvent.clear(nbRestartsInput)
    await userEvent.type(nbRestartsInput, '0')

    const maxDurationInput = screen.getByLabelText('Max duration in seconds')
    await userEvent.clear(maxDurationInput)
    await userEvent.type(maxDurationInput, '300')

    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })

  it('for a lifecycle job, should have at least one of three event check to be valid', async () => {
    renderWithProviders(
      <JobCreationFlow creationFlowUrl={mockPathname}>
        <StepConfigure />
      </JobCreationFlow>
    )

    const submitButton = await screen.findByRole('button', { name: /Continue/i })
    expect(submitButton).toBeInTheDocument()

    const checkbox = screen.getByLabelText('Deploy')
    checkbox.click()

    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })
})

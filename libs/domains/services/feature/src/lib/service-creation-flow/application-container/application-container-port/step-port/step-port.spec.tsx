import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerCreationFlow } from '../../application-container-creation-flow'
import { ApplicationContainerStepPort } from './step-port'

const mockOnBack = jest.fn()
const mockOnSubmit = jest.fn()

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
    slug: 'my-app',
  }),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
}))

describe('ApplicationContainerStepPort', () => {
  beforeEach(() => {
    mockOnBack.mockClear()
    mockOnSubmit.mockClear()
  })

  it('should render ports step with actions', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/create/container" defaultServiceType="CONTAINER">
        <ApplicationContainerStepPort onBack={mockOnBack} onSubmit={mockOnSubmit} />
      </ApplicationContainerCreationFlow>
    )

    expect(screen.getByRole('heading', { name: 'Ports' })).toBeInTheDocument()
    expect(screen.getByText('Configured ports')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add port' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(mockOnBack).toHaveBeenCalled()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    })

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })
})

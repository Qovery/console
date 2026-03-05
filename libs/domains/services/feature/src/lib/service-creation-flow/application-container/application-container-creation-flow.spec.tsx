import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ApplicationContainerCreationFlow,
  useApplicationContainerCreateContext,
} from './application-container-creation-flow'

const mockNavigate = jest.fn()

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
  useNavigate: () => mockNavigate,
  useSearch: () => ({}),
}))

function ContextConsumer() {
  const { currentStep, creationFlowUrl } = useApplicationContainerCreateContext()
  return (
    <span data-testid="context-consumer">
      step={currentStep} url={creationFlowUrl}
    </span>
  )
}

describe('ApplicationContainerCreationFlow', () => {
  it('should render and provide context to children', () => {
    renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/create/container">
        <ContextConsumer />
      </ApplicationContainerCreationFlow>
    )
    const consumer = screen.getByTestId('context-consumer')
    expect(consumer).toBeInTheDocument()
    expect(consumer).toHaveTextContent('step=1')
    expect(consumer).toHaveTextContent('url=/create/container')
  })

  it('should display the first step title', () => {
    renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/create/container">
        <div />
      </ApplicationContainerCreationFlow>
    )
    expect(screen.getByText('Create new application')).toBeInTheDocument()
  })

  it('should set default service type when defaultServiceType is provided', async () => {
    const FormSpy = () => {
      const { generalForm } = useApplicationContainerCreateContext()
      const serviceType = generalForm.watch('serviceType')
      return <span data-testid="service-type">{String(serviceType)}</span>
    }
    renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/create" defaultServiceType="CONTAINER">
        <FormSpy />
      </ApplicationContainerCreationFlow>
    )
    await waitFor(() => {
      expect(screen.getByTestId('service-type')).toHaveTextContent('CONTAINER')
    })
  })
})

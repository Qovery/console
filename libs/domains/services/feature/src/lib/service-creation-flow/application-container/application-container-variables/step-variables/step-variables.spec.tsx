import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ApplicationContainerCreationFlow,
  useApplicationContainerCreateContext,
} from '../../application-container-creation-flow'
import { ApplicationContainerStepVariables } from './step-variables'

const mockNavigate = jest.fn()

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
    slug: 'application',
  }),
  useSearch: () => ({ template: 'nextjs' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  FlowCreateVariable: ({ onAdd, onBack, onSubmit }: Record<string, (...args: unknown[]) => void>) => (
    <form onSubmit={onSubmit}>
      <button type="button" onClick={onAdd}>
        Add Variable
      </button>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="submit">Continue</button>
    </form>
  ),
}))

function VariablesState() {
  const { variablesForm } = useApplicationContainerCreateContext()
  return <div data-testid="variables-state">{JSON.stringify(variablesForm.watch('variables'))}</div>
}

describe('ApplicationContainerStepVariables', () => {
  const onBack = jest.fn()
  const onSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('adds a variable with application scope by default', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <>
          <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
          <VariablesState />
        </>
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Variable' }))

    await waitFor(() => {
      expect(screen.getByTestId('variables-state')).toHaveTextContent('"scope":"APPLICATION"')
    })
  })

  it('calls onBack when going back', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onBack).toHaveBeenCalled()
  })

  it('calls onSubmit on continue', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onSubmit).toHaveBeenCalled()
  })
})

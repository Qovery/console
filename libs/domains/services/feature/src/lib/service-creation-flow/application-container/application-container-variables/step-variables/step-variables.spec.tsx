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
  CreateUpdateVariableModal: ({
    onSubmitLocal,
    scope,
    isFile,
  }: {
    onSubmitLocal?: (data: {
      key: string
      value: string
      scope: 'APPLICATION' | 'CONTAINER'
      isSecret: boolean
      isFile: boolean
      mountPath?: string
    }) => void
    scope: 'APPLICATION' | 'CONTAINER'
    isFile?: boolean
  }) => (
    <button
      type="button"
      onClick={() =>
        onSubmitLocal?.({
          key: isFile ? 'CONFIG_FILE' : 'NODE_ENV',
          value: isFile ? '{"key":"value"}' : 'production',
          scope,
          isSecret: false,
          isFile: !!isFile,
          mountPath: isFile ? '/vault/secrets/config-file' : undefined,
        })
      }
    >
      Confirm variable modal
    </button>
  ),
}))

function VariablesState() {
  const { variablesForm } = useApplicationContainerCreateContext()
  return <div data-testid="variables-state">{JSON.stringify(variablesForm.watch())}</div>
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

    await userEvent.click(screen.getByRole('button', { name: /^add variable$/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm variable modal/i }))

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

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }))

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

    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))

    expect(onSubmit).toHaveBeenCalled()
  })
})

import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { type ReactNode, useEffect } from 'react'
import { type AddSecretModalSubmitData } from '@qovery/domains/variables/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ApplicationContainerCreationFlow,
  useApplicationContainerCreateContext,
} from '../../application-container-creation-flow'
import { ApplicationContainerStepVariables } from './step-variables'

const mockNavigate = jest.fn()
const mockUseVariablesSecretManagers = jest.fn(() => ({
  secretManagers: [] as SecretManagerAccess[],
  hasClusterSecretManagerConfigured: false,
  clusterId: 'cluster-1',
}))
const mockUseFeatureFlagEnabled = jest.fn(() => true)

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: () => mockUseFeatureFlagEnabled(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children }: { children: ReactNode }) => <a href="/cluster-settings">{children}</a>,
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
  AddSecretDropdown: jest.requireActual('@qovery/domains/variables/feature').AddSecretDropdown,
  AddSecretModal: ({
    isFile,
    isJson,
    onSubmit,
    onClose,
  }: {
    isFile?: boolean
    isJson?: boolean
    onSubmit: (data: AddSecretModalSubmitData) => void | Promise<void>
    onClose: () => void
  }) => (
    <button
      type="button"
      onClick={async () => {
        await onSubmit({
          name: 'My JSON credentials',
          reference: 'production/credentials',
          isJson,
          isFile: !!isFile,
          keyName: 'APP',
          secretManagerAccessId: 'manager-id',
        })
        onClose()
      }}
    >
      {isJson ? 'JSON secret modal' : isFile ? 'File secret modal' : 'Variable secret modal'}
    </button>
  ),
  VariableFormModal: ({
    onSubmit,
    scope,
    isSecret,
  }: {
    onSubmit?: (data: {
      key: string
      value: string
      scope: 'APPLICATION' | 'CONTAINER'
      isSecret: boolean
      isFile: boolean
      mountPath?: string
    }) => void
    scope: 'APPLICATION' | 'CONTAINER'
    isSecret?: boolean
  }) => (
    <button
      type="button"
      onClick={() =>
        onSubmit?.({
          key: 'NODE_ENV',
          value: 'production',
          scope,
          isSecret: !!isSecret,
          isFile: false,
        })
      }
    >
      Confirm variable modal
    </button>
  ),
  mapSecretManagersToSources: () => [],
  useVariablesSecretManagers: () => mockUseVariablesSecretManagers(),
}))

function VariablesState() {
  const { variablesForm } = useApplicationContainerCreateContext()
  return <div data-testid="variables-state">{JSON.stringify(variablesForm.watch())}</div>
}

function JsonSecretStep({ keyName }: { keyName?: string }) {
  const { variablesForm } = useApplicationContainerCreateContext()
  useEffect(() => {
    variablesForm.setValue('externalSecrets', [
      {
        name: 'Application credentials',
        reference: 'lucis/production/application',
        isJson: true,
        keyName,
      },
    ])
  }, [variablesForm, keyName])
  return <ApplicationContainerStepVariables onBack={jest.fn()} onSubmit={jest.fn()} />
}

describe('ApplicationContainerStepVariables', () => {
  const onBack = jest.fn()
  const onSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockUseVariablesSecretManagers.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: false,
      clusterId: 'cluster-1',
    })
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

  it('adds a secret with application scope by default', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /^add secret$/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm variable modal/i }))

    await waitFor(() => {
      expect(screen.getByTestId('variables-state')).toHaveTextContent('"scope":"APPLICATION"')
      expect(screen.getByTestId('variables-state')).toHaveTextContent('"isSecret":true')
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

  it.each([
    ['Add secret as variable', 'Variable secret modal'],
    ['Add secret as file', 'File secret modal'],
    ['Add secret as JSON', 'JSON secret modal'],
  ])('opens %s from the external secret dropdown', async (option, modal) => {
    mockUseVariablesSecretManagers.mockReturnValue({
      secretManagers: [{ id: 'first-source' }, { id: 'second-source' }] as SecretManagerAccess[],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-1',
    })
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
      </ApplicationContainerCreationFlow>
    )
    expect(screen.queryByRole('button', { name: 'Add secret as file' })).not.toBeInTheDocument()
    const addButtons = screen.getAllByRole('button', { name: 'Add secret' })
    await userEvent.click(addButtons[addButtons.length - 1])
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Add secret as variable',
      'Add secret as file',
      'Add secret as JSON',
    ])
    await userEvent.click(screen.getByRole('menuitem', { name: option }))
    expect(screen.getByText(modal)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: modal })).toBeEnabled()
  })

  it('adds and removes a user-entered JSON reference in the creation form', async () => {
    mockUseVariablesSecretManagers.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-1',
    })
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
        <VariablesState />
      </ApplicationContainerCreationFlow>
    )
    const buttons = screen.getAllByRole('button', { name: 'Add secret' })
    await userEvent.click(buttons[buttons.length - 1])
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add secret as JSON' }))
    await userEvent.click(screen.getByRole('button', { name: 'JSON secret modal' }))
    expect(screen.getByText('My JSON credentials')).toBeInTheDocument()
    expect(screen.getByText('JSON path: APP')).toBeInTheDocument()
    expect(screen.getByTestId('variables-state')).toHaveTextContent('"keyName":"APP"')
    await userEvent.click(screen.getByRole('button', { name: 'Delete secret' }))
    expect(screen.queryByText('My JSON credentials')).not.toBeInTheDocument()
  })

  it.each(['APP', 'APP_'])('renders JSON references with key name %s without expandable key details', (keyName) => {
    mockUseVariablesSecretManagers.mockReturnValue({
      secretManagers: [],
      hasClusterSecretManagerConfigured: true,
      clusterId: 'cluster-1',
    })
    renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <JsonSecretStep keyName={keyName} />
      </ApplicationContainerCreationFlow>
    )
    expect(screen.getByText('Application credentials')).toBeInTheDocument()
    expect(screen.getByText('lucis/production/application')).toBeInTheDocument()
    expect(screen.getByText(`JSON path: ${keyName}`)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Expand keys|Collapse keys|Copy DATABASE_URL/)).not.toBeInTheDocument()
    expect(screen.queryByText(/secrets imported/)).not.toBeInTheDocument()
  })

  it('does not expose external secret creation when no secret manager is linked', () => {
    renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <ApplicationContainerStepVariables onBack={onBack} onSubmit={onSubmit} />
      </ApplicationContainerCreationFlow>
    )

    expect(screen.getByText('No secret manager linked on your cluster')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^add secret as file$/i })).not.toBeInTheDocument()
  })
})

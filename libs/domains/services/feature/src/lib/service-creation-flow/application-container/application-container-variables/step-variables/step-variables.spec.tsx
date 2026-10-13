import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { type ReactNode, useEffect } from 'react'
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
  createJsonSecretPreview: () => [{ reference: 'lucis/production/application', keys: ['DATABASE_URL'] }],
  JsonSecretKeys: jest.requireActual('@qovery/domains/variables/feature').JsonSecretKeys,
  AddSecretDropdown: jest.requireActual('@qovery/domains/variables/feature').AddSecretDropdown,
  AddSecretModal: ({
    isFile,
    isJson,
    jsonSecrets,
  }: {
    isFile?: boolean
    isJson?: boolean
    jsonSecrets?: { reference: string; keys?: string[] }[]
  }) => (
    <div>
      <span>{isJson ? 'JSON secret modal' : isFile ? 'File secret modal' : 'Variable secret modal'}</span>
      {isJson &&
        jsonSecrets?.map((secret, index) => (
          <span key={`${secret.reference}-${index}`}>
            {secret.reference}: {secret.keys?.join(', ')}
          </span>
        ))}
    </div>
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

function JsonSecretStep() {
  const { variablesForm } = useApplicationContainerCreateContext()
  useEffect(() => {
    variablesForm.setValue('externalSecrets', [
      {
        name: 'Application credentials',
        reference: 'lucis/production/application',
        isJson: true,
        keys: ['DATABASE_URL'],
      },
    ])
  }, [variablesForm])
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
    expect(screen.queryAllByText('lucis/production/application: DATABASE_URL')).toHaveLength(
      option === 'Add secret as JSON' ? 2 : 0
    )
  })

  it('toggles JSON keys from the name cell using pointer and keyboard', async () => {
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
        <JsonSecretStep />
      </ApplicationContainerCreationFlow>
    )
    expect(screen.getByRole('button', { name: 'Copy DATABASE_URL' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('Application credentials'))
    expect(screen.queryByRole('button', { name: 'Copy DATABASE_URL' })).not.toBeInTheDocument()
    const cell = screen.getByRole('button', { name: 'Expand keys for lucis/production/application' })
    expect(cell).toHaveAttribute('aria-expanded', 'false')
    cell.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Copy DATABASE_URL' })).toBeInTheDocument()
    await userEvent.keyboard(' ')
    expect(screen.queryByRole('button', { name: 'Copy DATABASE_URL' })).not.toBeInTheDocument()
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

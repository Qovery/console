import { useEffect, useState } from 'react'
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

function VariablesFixture({ hasPorts = false }: { hasPorts?: boolean }) {
  const { portForm } = useApplicationContainerCreateContext()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    portForm.reset({
      ports: hasPorts
        ? [
            {
              application_port: 3000,
              is_public: true,
              protocol: 'HTTP',
              external_port: 443,
              name: 'web',
            },
          ]
        : [],
      healthchecks: undefined,
    })
    setReady(true)
  }, [hasPorts, portForm])

  if (!ready) return null

  return (
    <>
      <ApplicationContainerStepVariables />
      <VariablesState />
    </>
  )
}

describe('ApplicationContainerStepVariables', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('adds a variable with application scope by default', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <VariablesFixture />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Variable' }))

    await waitFor(() => {
      expect(screen.getByTestId('variables-state')).toHaveTextContent('"scope":"APPLICATION"')
    })
  })

  it('navigates to ports when going back without ports', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <VariablesFixture />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/application/ports',
      search: { template: 'nextjs' },
    })
  })

  it('navigates to summary on continue and back to health checks when ports exist', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow
        creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application"
        defaultServiceType="APPLICATION"
      >
        <VariablesFixture hasPorts />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/application/health-checks',
      search: { template: 'nextjs' },
    })
    expect(mockNavigate).toHaveBeenNthCalledWith(2, {
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/application/summary',
      search: { template: 'nextjs' },
    })
  })
})

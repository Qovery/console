import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { RunAgainButton } from './run-again-button'

const mockEnvironment = environmentFactoryMock(1)[0]

const mockDeployAllServices = jest.fn()
const mockRestartAllServices = jest.fn()
const mockStopAllServices = jest.fn()
const mockUninstallAllServices = jest.fn()
const mockDeleteAllServices = jest.fn()
const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useDeployAllServices: () => ({ mutate: mockDeployAllServices }),
  useRestartAllServices: () => ({ mutate: mockRestartAllServices }),
  useStopAllServices: () => ({ mutate: mockStopAllServices }),
  useUninstallAllServices: () => ({ mutate: mockUninstallAllServices }),
  useDeleteAllServices: () => ({ mutate: mockDeleteAllServices }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: () => ({ openModalConfirmation: mockOpenModalConfirmation }),
}))

function buildDeploymentHistory(
  triggerAction: string,
  services: { service_id: string; service_type: string; name: string }[]
) {
  return {
    trigger_action: triggerAction,
    stages: [
      {
        name: 'stage-1',
        services: services.map((identifier) => ({ identifier })),
      },
    ],
  } as unknown as DeploymentHistoryEnvironmentV2
}

describe('RunAgainButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a "Run again" button with the arrow-rotate-right icon', () => {
    const { baseElement } = renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="RUNNING"
      />
    )
    expect(screen.getByRole('button', { name: /run again/i })).toBeInTheDocument()
    expect(baseElement.querySelector('.fa-arrow-rotate-right')).toBeInTheDocument()
  })

  it('replays a DEPLOY scoped to the deployment services', async () => {
    const { userEvent } = renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
          { service_id: 'db-1', service_type: 'DATABASE', name: 'db' },
        ])}
        state="RUNNING"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /run again/i }))

    expect(mockDeployAllServices).toHaveBeenCalledWith({
      environment: mockEnvironment,
      payload: {
        applications: [{ application_id: 'app-1' }],
        containers: [],
        databases: ['db-1'],
        jobs: [],
        helms: [],
        terraforms: [],
      },
    })
    expect(mockRestartAllServices).not.toHaveBeenCalled()
    expect(mockStopAllServices).not.toHaveBeenCalled()
    expect(mockUninstallAllServices).not.toHaveBeenCalled()
    expect(mockDeleteAllServices).not.toHaveBeenCalled()
  })

  it('replays a RESTART scoped to the deployment services', async () => {
    const { userEvent } = renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('RESTART', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
          { service_id: 'container-1', service_type: 'CONTAINER', name: 'container' },
          { service_id: 'db-1', service_type: 'DATABASE', name: 'db' },
        ])}
        state="RUNNING"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /run again/i }))

    expect(mockRestartAllServices).toHaveBeenCalledWith({
      environment: mockEnvironment,
      payload: {
        application_ids: ['app-1'],
        container_ids: ['container-1'],
        database_ids: ['db-1'],
      },
    })
  })

  it('opens a confirmation modal for a destructive STOP without stopping immediately', async () => {
    const { userEvent } = renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('STOP', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="RUNNING"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /run again/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Confirm stop', name: mockEnvironment.name })
    )
    expect(mockStopAllServices).not.toHaveBeenCalled()
  })

  it('disables the button while a deployment is in progress', () => {
    renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="DEPLOYING"
      />
    )
    expect(screen.getByRole('button', { name: /run again/i })).toBeDisabled()
  })

  it('disables the button for an action that cannot be replayed', () => {
    renderWithProviders(
      <RunAgainButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('TERRAFORM_FORCE_UNLOCK', [
          { service_id: 'tf-1', service_type: 'TERRAFORM', name: 'tf' },
        ])}
        state="RUNNING"
      />
    )
    expect(screen.getByRole('button', { name: /run again/i })).toBeDisabled()
  })
})

import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DeploymentActionButton } from './deployment-action-button'

const mockEnvironment = environmentFactoryMock(1)[0]

const mockDeployAllServices = jest.fn()
const mockRestartAllServices = jest.fn()
const mockStopAllServices = jest.fn()
const mockUninstallAllServices = jest.fn()
const mockDeleteAllServices = jest.fn()
const mockCancel = jest.fn()
const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useDeployAllServices: () => ({ mutate: mockDeployAllServices }),
  useRestartAllServices: () => ({ mutate: mockRestartAllServices }),
  useStopAllServices: () => ({ mutate: mockStopAllServices }),
  useUninstallAllServices: () => ({ mutate: mockUninstallAllServices }),
  useDeleteAllServices: () => ({ mutate: mockDeleteAllServices }),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  ...jest.requireActual('@qovery/domains/environments/feature'),
  useCancelDeploymentEnvironment: () => ({ mutate: mockCancel }),
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

describe('DeploymentActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a "Run again" button with the arrow-rotate-right icon in a finished state', () => {
    const { baseElement } = renderWithProviders(
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="DEPLOYED"
      />
    )
    expect(screen.getByRole('button', { name: /run again/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cancel deployment/i })).not.toBeInTheDocument()
    expect(baseElement.querySelector('.fa-arrow-rotate-right')).toBeInTheDocument()
  })

  it('renders a "Cancel deployment" button while a deployment is in progress and confirms before cancelling', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="DEPLOYING"
      />
    )

    expect(screen.getByRole('button', { name: /cancel deployment/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /run again/i })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /cancel deployment/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: 'Confirm cancel' }))
    expect(mockCancel).not.toHaveBeenCalled()
  })

  it('replays a DEPLOY scoped to the deployment services', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DEPLOY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
          { service_id: 'db-1', service_type: 'DATABASE', name: 'db' },
        ])}
        state="DEPLOYED"
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
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('RESTART', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
          { service_id: 'container-1', service_type: 'CONTAINER', name: 'container' },
          { service_id: 'db-1', service_type: 'DATABASE', name: 'db' },
        ])}
        state="DEPLOYED"
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
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('STOP', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="DEPLOYED"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /run again/i }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Confirm stop', name: mockEnvironment.name })
    )
    expect(mockStopAllServices).not.toHaveBeenCalled()
  })

  it('disables the "Run again" button for DELETE_RESOURCES_ONLY and does not trigger any mutation', async () => {
    const { userEvent } = renderWithProviders(
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('DELETE_RESOURCES_ONLY', [
          { service_id: 'app-1', service_type: 'APPLICATION', name: 'app' },
        ])}
        state="DEPLOYED"
      />
    )

    const button = screen.getByRole('button', { name: /run again/i })
    expect(button).toBeDisabled()

    await userEvent.click(button)

    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
    expect(mockDeployAllServices).not.toHaveBeenCalled()
    expect(mockRestartAllServices).not.toHaveBeenCalled()
    expect(mockStopAllServices).not.toHaveBeenCalled()
    expect(mockUninstallAllServices).not.toHaveBeenCalled()
    expect(mockDeleteAllServices).not.toHaveBeenCalled()
  })

  it('disables the "Run again" button for an unmapped action (TERRAFORM_FORCE_UNLOCK)', () => {
    renderWithProviders(
      <DeploymentActionButton
        environment={mockEnvironment}
        deploymentHistory={buildDeploymentHistory('TERRAFORM_FORCE_UNLOCK', [
          { service_id: 'tf-1', service_type: 'TERRAFORM', name: 'tf' },
        ])}
        state="DEPLOYED"
      />
    )

    expect(screen.getByRole('button', { name: /run again/i })).toBeDisabled()
  })
})

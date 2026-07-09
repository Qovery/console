import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentsTableActionBar } from './environments-table-action-bar'

const mockStopEnvironment = jest.fn()
const mockOpenModalConfirmation = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

jest.mock('../hooks/use-stop-environment/use-stop-environment', () => ({
  useStopEnvironment: () => ({
    mutateAsync: mockStopEnvironment,
  }),
}))

const rows: EnvironmentOverviewResponse[] = [
  {
    id: 'env-1',
    name: 'Stoppable environment',
    mode: EnvironmentModeEnum.DEVELOPMENT,
    services_overview: {
      service_count: 2,
      managed_by: 'QOVERY',
    },
    deployment_status: {
      last_deployment_state: 'DEPLOYED',
    },
  },
  {
    id: 'env-2',
    name: 'Stopped environment',
    mode: EnvironmentModeEnum.DEVELOPMENT,
    services_overview: {
      service_count: 2,
      managed_by: 'QOVERY',
    },
    deployment_status: {
      last_deployment_state: 'STOPPED',
    },
  },
] as EnvironmentOverviewResponse[]

describe('EnvironmentsTableActionBar', () => {
  beforeEach(() => {
    mockStopEnvironment.mockReset()
    mockOpenModalConfirmation.mockReset()
    mockStopEnvironment.mockResolvedValue(undefined)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <EnvironmentsTableActionBar projectId="project-1" selectedRows={[]} resetRowSelection={jest.fn()} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should show selected environment count', () => {
    renderWithProviders(
      <EnvironmentsTableActionBar projectId="project-1" selectedRows={rows} resetRowSelection={jest.fn()} />
    )

    expect(screen.getByText('2 selected environments')).toBeInTheDocument()
  })

  it('should disable stop action when no selected environment can be stopped', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentsTableActionBar projectId="project-1" selectedRows={[rows[1]]} resetRowSelection={jest.fn()} />
    )

    await userEvent.click(screen.getByRole('button', { name: /more/i }))

    const stopSelectedItem = screen.getByText('Stop selected')
    expect(stopSelectedItem.closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true')

    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
  })

  it('should confirm and stop only stoppable selected environments', async () => {
    const resetRowSelection = jest.fn()
    const selectedRows = [
      ...rows,
      {
        id: 'env-3',
        name: 'Restarted environment',
        mode: EnvironmentModeEnum.DEVELOPMENT,
        services_overview: {
          service_count: 2,
          managed_by: 'QOVERY',
        },
        deployment_status: {
          last_deployment_state: 'RESTARTED',
        },
      },
    ] as EnvironmentOverviewResponse[]

    const { userEvent } = renderWithProviders(
      <EnvironmentsTableActionBar
        projectId="project-1"
        selectedRows={selectedRows}
        resetRowSelection={resetRowSelection}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /more/i }))
    await userEvent.click(screen.getByText('Stop selected'))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm stop',
        confirmationMethod: 'action',
        confirmationAction: 'stop',
      })
    )

    const modalProps = mockOpenModalConfirmation.mock.calls[0][0]
    renderWithProviders(modalProps.description)
    expect(screen.getByText(/You are going to stop 2 environments/)).toBeInTheDocument()

    renderWithProviders(modalProps.warning)
    expect(screen.getByText('Some environments will not be impacted:')).toBeInTheDocument()
    expect(screen.getByText('Stopped environment')).toBeInTheDocument()

    await modalProps.action()

    expect(mockStopEnvironment).toHaveBeenCalledTimes(2)
    expect(mockStopEnvironment).toHaveBeenCalledWith({ environmentId: 'env-1' })
    expect(mockStopEnvironment).toHaveBeenCalledWith({ environmentId: 'env-3' })
    expect(resetRowSelection).toHaveBeenCalledTimes(1)
  })
})

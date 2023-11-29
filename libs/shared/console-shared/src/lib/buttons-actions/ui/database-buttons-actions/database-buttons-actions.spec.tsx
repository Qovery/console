import { DatabaseModeEnum, ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import { RunningState } from '@qovery/shared/enums'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseButtonsActions, type DatabaseButtonsActionsProps } from './database-buttons-actions'

const mockDatabase = databaseFactoryMock(1)[0]
const props: DatabaseButtonsActionsProps = {
  database: mockDatabase,
  environmentMode: 'development',
}

describe('DatabaseButtonsActionsFeature', () => {
  beforeEach(() => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.STOPPED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    jest.spyOn(domainsServicesFeature, 'useRunningStatus').mockReturnValue({
      data: {
        state: RunningState.DEPLOYED,
        id: 'id',
        pods: [],
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for DEPLOYED status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValueOnce({
      data: {
        state: StateEnum.DEPLOYED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { userEvent } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Redeploy')
    screen.getByText('Stop')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Restart Database')
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Delete database')
  })

  it('should render actions for STOPPED status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValueOnce({
      data: {
        state: StateEnum.STOPPED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { userEvent } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Deploy')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Delete database')
  })

  it('should render actions for DELETING status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DELETING,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { userEvent } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Cancel delete')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
  })

  it('should not render Restart Database if running status is not running', async () => {
    jest.spyOn(domainsServicesFeature, 'useRunningStatus').mockReturnValue({
      data: {
        state: RunningState.STOPPED,
        id: 'id',
        pods: [],
      },
    })

    const { userEvent } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    expect(screen.queryByText('Restart Database')).toBeNull()
  })

  it('should not render Restart Database if database is managed', async () => {
    mockDatabase.mode = DatabaseModeEnum.MANAGED

    const { userEvent } = renderWithProviders(<DatabaseButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    expect(screen.queryByText('Restart Database')).toBeNull()
  })
})

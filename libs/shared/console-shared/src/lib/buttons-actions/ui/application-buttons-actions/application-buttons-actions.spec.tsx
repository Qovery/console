import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import { RunningState } from '@qovery/shared/enums'
import { applicationFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationButtonsActions, type ApplicationButtonsActionsProps } from './application-buttons-actions'

const mockApplication = applicationFactoryMock(1)[0]

const props: ApplicationButtonsActionsProps = {
  application: mockApplication,
  environmentMode: 'development',
}

describe('ApplicationButtonsActionsFeature', () => {
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
    const { baseElement } = renderWithProviders(<ApplicationButtonsActions {...props} />)
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
    const { userEvent } = renderWithProviders(<ApplicationButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Redeploy')
    screen.getByText('Stop')
    screen.getByText('Deploy other version')
    screen.getByText('Restart Service')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Edit code')
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Open settings')
    screen.getByText('Delete service')
  })

  it('should render actions for STOPPED status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValueOnce({
      data: {
        state: StateEnum.STOPPED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { userEvent } = renderWithProviders(<ApplicationButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Deploy')
    screen.getByText('Deploy other version')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Edit code')
    screen.getByText('Copy identifiers')
    screen.getByText('See audit logs')
    screen.getByText('Open settings')
    screen.getByText('Delete service')
  })

  it('should render actions for DELETING status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DELETING,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { userEvent } = renderWithProviders(<ApplicationButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    screen.getByText('Deploy other version')

    await userEvent.click(actions[actions.length - 1])
    screen.getByText('Edit code')
    screen.getByText('Logs')
    screen.getByText('See audit logs')
    screen.getByText('Copy identifiers')
    screen.getByText('Cancel delete')
    screen.getByText('Open settings')
  })

  it('should not render Restart Service if running status is not running', async () => {
    jest.spyOn(domainsServicesFeature, 'useRunningStatus').mockReturnValue({
      data: {
        state: RunningState.STOPPED,
        id: 'id',
        pods: [],
      },
    })

    const { userEvent } = renderWithProviders(<ApplicationButtonsActions {...props} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    expect(screen.queryByText('Restart Service')).toBeNull()
  })

  it('should not render Restart Service if application is a job', async () => {
    const mockJob = lifecycleJobFactoryMock(1)[0]

    const { userEvent } = renderWithProviders(<ApplicationButtonsActions {...props} application={mockJob} />)
    const actions = screen.getAllByTestId('element')

    await userEvent.click(actions[0])
    expect(screen.queryByText('Restart Service')).toBeNull()
  })
})

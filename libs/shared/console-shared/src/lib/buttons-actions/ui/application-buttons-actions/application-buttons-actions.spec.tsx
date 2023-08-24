import { getByText, queryByText, render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import { RunningState } from '@qovery/shared/enums'
import { applicationFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { ApplicationButtonsActions, ApplicationButtonsActionsProps } from './application-buttons-actions'

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
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)
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
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Restart Service')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
    getByText(baseElement, 'Deploy other version')
  })

  it('should render actions for STOPPED status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValueOnce({
      data: {
        state: StateEnum.STOPPED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
    getByText(baseElement, 'Deploy other version')
  })

  it('should render actions for DELETING status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DELETING,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Logs')
    getByText(baseElement, 'Deploy other version')
    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Cancel delete')
    getByText(baseElement, 'Open settings')
  })

  it('should not render Restart Service if running status is not running', async () => {
    jest.spyOn(domainsServicesFeature, 'useRunningStatus').mockReturnValue({
      data: {
        state: RunningState.STOPPED,
        id: 'id',
        pods: [],
      },
    })

    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    expect(queryByText(baseElement, 'Restart Service')).toBeNull()
  })

  it('should not render Restart Service if application is a job', async () => {
    const mockJob = lifecycleJobFactoryMock(1)[0]

    const { baseElement } = render(<ApplicationButtonsActions {...props} application={mockJob} />)

    expect(queryByText(baseElement, 'Restart Service')).toBeNull()
  })
})

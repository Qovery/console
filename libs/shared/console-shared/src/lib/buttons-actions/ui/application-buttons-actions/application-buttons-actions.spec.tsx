import { getByText, queryByText } from '__tests__/utils/setup-jest'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { RunningStatus } from '@qovery/shared/enums'
import { applicationFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { ApplicationButtonsActions, ApplicationButtonsActionsProps } from './application-buttons-actions'

const mockApplication = applicationFactoryMock(1)[0]

const props: ApplicationButtonsActionsProps = {
  application: mockApplication,
  environmentMode: 'development',
}

describe('ApplicationButtonsActionsFeature', () => {
  beforeEach(() => {
    mockApplication.status = {
      state: StateEnum.STOPPED,
      id: 'id',
      message: 'message',
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
    }
    mockApplication.running_status = {
      state: RunningStatus.DEPLOYED,
      id: 'id',
      pods: [],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for DEPLOYED status', async () => {
    mockApplication.status.state = StateEnum.DEPLOYED
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
    mockApplication.status.state = StateEnum.STOPPED
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
    mockApplication.status.state = StateEnum.DELETING
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
    if (mockApplication.running_status) {
      mockApplication.running_status.state = RunningStatus.STOPPED
    }

    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    expect(queryByText(baseElement, 'Restart Service')).toBeNull()
  })

  it('should not render Restart Service if application is a job', async () => {
    const mockJob = lifecycleJobFactoryMock(1)[0]
    mockJob.status = {
      state: StateEnum.STOPPED,
      id: 'id',
      message: 'message',
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
    }
    mockJob.running_status = {
      state: RunningStatus.DEPLOYED,
      id: 'id',
      pods: [],
    }

    const { baseElement } = render(<ApplicationButtonsActions {...props} application={mockJob} />)

    expect(queryByText(baseElement, 'Restart Service')).toBeNull()
  })
})

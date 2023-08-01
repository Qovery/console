import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum, Status } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@qovery/shared/factories'
import EnvironmentButtonsActions, { EnvironmentButtonsActionsProps } from './environment-buttons-actions'

const mockEnvironment = environmentFactoryMock(1)[0]
const props: EnvironmentButtonsActionsProps = {
  environment: mockEnvironment,
  hasServices: true,
}

describe('EnvironmentButtonsActions', () => {
  let status: Status

  beforeEach(() => {
    status = {
      message: 'message',
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      state: StateEnum.STOPPED,
      last_deployment_date: '2021-05-20T09:00:00.000Z',
      id: 'id',
    }

    props.status = status
  })

  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render buttons with Stopped status', () => {
    props.status!.state = StateEnum.STOPPED
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })

  it('should render buttons with Running status', () => {
    props.status!.state = StateEnum.DEPLOYED
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })

  it('should render actions for DELETING status', async () => {
    status.state = StateEnum.DELETING
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)

    getByText(baseElement, 'Logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Export as Terraform')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Cancel delete')
  })
})

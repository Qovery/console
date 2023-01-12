import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@qovery/shared/factories'
import EnvironmentButtonsActions, { EnvironmentButtonsActionsProps } from './environment-buttons-actions'

const mockEnvironment = environmentFactoryMock(1)[0]
mockEnvironment.status = {}
const props: EnvironmentButtonsActionsProps = {
  environment: mockEnvironment,
  hasServices: true,
}

describe('EnvironmentButtonsActions', () => {
  beforeEach(() => {
    mockEnvironment.status = {
      message: 'message',
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      state: StateEnum.STOPPED,
      last_deployment_date: '2021-05-20T09:00:00.000Z',
      id: 'id',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render buttons with Stopped status', () => {
    mockEnvironment.status.state = StateEnum.STOPPED
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })

  it('should render buttons with Running status', () => {
    mockEnvironment.status.state = StateEnum.RUNNING
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Clone')
    getByText(baseElement, 'Delete environment')
  })
})

import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
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
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for RUNNING status', async () => {
    mockApplication.status.state = StateEnum.RUNNING
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
  })

  it('should render actions for STOPPED status', async () => {
    mockApplication.status.state = StateEnum.STOPPED
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
  })
})

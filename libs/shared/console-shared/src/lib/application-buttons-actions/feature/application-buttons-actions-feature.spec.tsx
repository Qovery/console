import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/domains/application'
import {
  ApplicationButtonsActionsFeature,
  ApplicationButtonsActionsFeatureProps,
} from './application-buttons-actions-feature'

const mockApplication = applicationFactoryMock(1)[0]

const props: ApplicationButtonsActionsFeatureProps = {
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
    const { baseElement } = render(<ApplicationButtonsActionsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for RUNNING status', async () => {
    mockApplication.status.state = StateEnum.RUNNING
    const { baseElement } = render(<ApplicationButtonsActionsFeature {...props} />)

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
  })

  it('should render actions for STOPPED status', async () => {
    mockApplication.status.state = StateEnum.STOPPED
    const { baseElement } = render(<ApplicationButtonsActionsFeature {...props} />)

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'Edit code')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Open settings')
    getByText(baseElement, 'Delete service')
  })
})

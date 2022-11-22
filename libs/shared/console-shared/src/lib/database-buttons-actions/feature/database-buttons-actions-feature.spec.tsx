import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/domains/database'
import { DatabaseButtonsActionsFeature, DatabaseButtonsActionsFeatureProps } from './database-buttons-actions-feature'

const mockDatabase = databaseFactoryMock(1)[0]
const props: DatabaseButtonsActionsFeatureProps = {
  database: mockDatabase,
  environmentMode: 'development',
}

describe('DatabaseButtonsActionsFeature', () => {
  beforeEach(() => {
    mockDatabase.status = {
      state: StateEnum.STOPPED,
      id: 'id',
      message: 'message',
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseButtonsActionsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render actions for RUNNING status', async () => {
    mockDatabase.status.state = StateEnum.RUNNING
    const { baseElement } = render(<DatabaseButtonsActionsFeature {...props} />)

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Delete database')
  })

  it('should render actions for STOPPED status', async () => {
    mockDatabase.status.state = StateEnum.STOPPED
    const { baseElement } = render(<DatabaseButtonsActionsFeature {...props} />)

    getByText(baseElement, 'Deploy')

    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Delete database')
  })
})

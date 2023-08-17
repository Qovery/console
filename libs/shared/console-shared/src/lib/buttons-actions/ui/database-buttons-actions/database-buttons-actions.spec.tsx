import { getByText, queryByText, render } from '__tests__/utils/setup-jest'
import { DatabaseModeEnum, ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import { RunningState } from '@qovery/shared/enums'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { DatabaseButtonsActions, DatabaseButtonsActionsProps } from './database-buttons-actions'

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
    const { baseElement } = render(<DatabaseButtonsActions {...props} />)
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
    const { baseElement } = render(<DatabaseButtonsActions {...props} />)

    getByText(baseElement, 'Redeploy')
    getByText(baseElement, 'Stop')
    getByText(baseElement, 'Restart Database')
    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Delete database')
  })

  it('should render actions for STOPPED status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValueOnce({
      data: {
        state: StateEnum.STOPPED,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { baseElement } = render(<DatabaseButtonsActions {...props} />)

    getByText(baseElement, 'Deploy')
    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Delete database')
  })

  it('should render actions for DELETING status', async () => {
    jest.spyOn(domainsServicesFeature, 'useDeploymentStatus').mockReturnValue({
      data: {
        state: StateEnum.DELETING,
        id: 'id',
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      },
    })
    const { baseElement } = render(<DatabaseButtonsActions {...props} />)

    getByText(baseElement, 'See audit logs')
    getByText(baseElement, 'Copy identifiers')
    getByText(baseElement, 'Cancel delete')
  })

  it('should not render Restart Database if running status is not running', async () => {
    jest.spyOn(domainsServicesFeature, 'useRunningStatus').mockReturnValue({
      data: {
        state: RunningState.STOPPED,
        id: 'id',
        pods: [],
      },
    })

    const { baseElement } = render(<DatabaseButtonsActions {...props} />)

    expect(queryByText(baseElement, 'Restart Database')).toBeNull()
  })

  it('should not render Restart Database if database is managed', async () => {
    mockDatabase.mode = DatabaseModeEnum.MANAGED

    const { baseElement } = render(<DatabaseButtonsActions {...props} />)

    expect(queryByText(baseElement, 'Restart Database')).toBeNull()
  })
})

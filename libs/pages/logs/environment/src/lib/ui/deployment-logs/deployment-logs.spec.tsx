import { render, screen } from '__tests__/utils/setup-jest'
import { ClusterLogsStepEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { deploymentLogFactoryMock } from '@qovery/shared/factories'
import { dateFullFormat, trimId } from '@qovery/shared/utils'
import DeploymentLogs, { type DeploymentLogsProps } from './deployment-logs'

const mockLogs = deploymentLogFactoryMock(1)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3', serviceId: '4', versionId: '5' }),
}))

describe('DeploymentLogs', () => {
  const props: DeploymentLogsProps = {
    loadingStatus: 'loaded',
    logs: mockLogs,
    errors: [
      {
        index: 0,
        error: {},
        timeAgo: '20',
        step: ClusterLogsStepEnum.DELETE_ERROR,
      },
    ],
    hideDeploymentLogs: false,
    serviceDeploymentStatus: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
    setPauseStatusLogs: jest.fn(),
    pauseStatusLogs: false,
    serviceName: 'service-name',
  }

  beforeEach(() => {
    window.HTMLElement.prototype.scroll = jest.fn()
  })

  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentLogs {...props} />)
    expect(baseElement).toBeTruthy()

    const message = mockLogs[0].message?.safe_message || ''
    screen.getByText(message)
  })

  it('should render a placeholder message when logs are hidden', () => {
    props.hideDeploymentLogs = true
    props.serviceName = 'my-app'
    props.serviceDeploymentStatus = ServiceDeploymentStatusEnum.OUT_OF_DATE

    render(<DeploymentLogs {...props} />)

    screen.getByText((content, element) => element?.textContent === 'No logs on this execution for my-app.')
    screen.getByText('This service was deployed more than 30 days and thus no deployment logs are available.')
  })

  it('should render a placeholder with spinner if logs not loaded', () => {
    props.hideDeploymentLogs = true
    props.logs = []
    props.loadingStatus = 'not loaded'
    props.serviceDeploymentStatus = undefined

    render(<DeploymentLogs {...props} />)

    screen.getByTestId('spinner')
  })

  it('should render a placeholder with a deployment history', () => {
    props.hideDeploymentLogs = true
    props.loadingStatus = 'loaded'
    props.serviceDeploymentStatus = ServiceDeploymentStatusEnum.OUT_OF_DATE
    props.serviceName = 'my-app'
    props.dataDeploymentHistory = [
      {
        id: 'deployment-id',
        created_at: new Date().toString(),
        applications: [
          {
            id: '4',
            created_at: new Date().toString(),
            name: 'my-app',
          },
        ],
      },
    ]

    render(<DeploymentLogs {...props} />)

    screen.getByText(
      (content, element) => element?.textContent === 'my-app service was not deployed within this deployment execution.'
    )
    screen.getByText(trimId(props.dataDeploymentHistory[0].id))
    screen.getByText(dateFullFormat(props.dataDeploymentHistory[0].created_at))
  })
})

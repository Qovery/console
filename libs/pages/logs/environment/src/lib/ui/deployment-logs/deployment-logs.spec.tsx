import { ClusterLogsStepEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, deploymentLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { dateFullFormat, trimId } from '@qovery/shared/utils'
import DeploymentLogs, { type DeploymentLogsProps } from './deployment-logs'

const mockLogs = deploymentLogFactoryMock(1)
const mockApplication = applicationFactoryMock(1)[0]

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
    service: mockApplication,
  }

  beforeEach(() => {
    window.HTMLElement.prototype.scroll = jest.fn()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DeploymentLogs {...props} />)
    expect(baseElement).toBeTruthy()

    const message = mockLogs[0].message?.safe_message || ''
    screen.getByText(message)
  })

  it('should render a placeholder with a deployment history', () => {
    props.hideDeploymentLogs = true
    props.loadingStatus = 'loaded'
    props.serviceDeploymentStatus = ServiceDeploymentStatusEnum.OUT_OF_DATE

    const name = mockApplication.name

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

    renderWithProviders(<DeploymentLogs {...props} />)

    screen.getByText(
      (_, element) => element?.textContent === `${name} service was not deployed within this deployment execution.`
    )
    screen.getByText(trimId(props.dataDeploymentHistory[0].id))
    screen.getByText(dateFullFormat(props.dataDeploymentHistory[0].created_at))
  })
})

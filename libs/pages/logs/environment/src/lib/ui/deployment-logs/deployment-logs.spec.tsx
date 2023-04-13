import { render } from '__tests__/utils/setup-jest'
import { ClusterLogsStepEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import DeploymentLogs, { DeploymentLogsProps } from './deployment-logs'

describe('DeploymentLogs', () => {
  const props: DeploymentLogsProps = {
    loadingStatus: 'loaded',
    logs: [
      {
        type: LogsType.INFO,
        timestamp: new Date().toString(),
        details: {
          stage: {
            step: 'Deployed',
          },
        },
        message: {
          safe_message: 'Log 1',
        },
      },
    ],
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
  }

  beforeEach(() => {
    window.HTMLElement.prototype.scroll = jest.fn()
  })

  it('should render successfully', () => {
    const { getByText, baseElement } = render(<DeploymentLogs {...props} />)
    expect(baseElement).toBeTruthy()
    expect(getByText('Log 1')).toBeInTheDocument()
  })

  it('should renders placeholder message when logs are hidden', () => {
    props.hideDeploymentLogs = true
    const { getByText } = render(<DeploymentLogs {...props} />)

    expect(getByText('This service has never been deployed and thus no logs are available.')).toBeInTheDocument()
  })
})

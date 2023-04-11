import { EnvironmentLogs, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { RunningStatus } from '@qovery/shared/enums'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Link } from '@qovery/shared/ui'
import RowDeployment from '../row-deployment/row-deployment'

export interface DeploymentLogsProps {
  loadingStatus: LoadingStatus
  logs: EnvironmentLogs[]
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  errors: ErrorLogsProps[]
  hideDeploymentLogs?: boolean
  serviceRunningStatus?: RunningStatus
  serviceDeploymentStatus?: ServiceDeploymentStatusEnum
}

export function DeploymentLogs(props: DeploymentLogsProps) {
  const {
    logs,
    errors,
    hideDeploymentLogs,
    pauseStatusLogs,
    setPauseStatusLogs,
    serviceRunningStatus,
    serviceDeploymentStatus,
    loadingStatus,
  } = props

  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const memoRow = useMemo(
    () => logs?.map((log: EnvironmentLogs, index: number) => <RowDeployment key={index} index={index} data={log} />),
    [logs]
  )

  const displayPlaceholder = (serviceDeploymentStatus?: ServiceDeploymentStatusEnum) => {
    switch (serviceDeploymentStatus) {
      case ServiceDeploymentStatusEnum.NEVER_DEPLOYED:
        return 'This service has never been deployed and no thus logs are available.'
      default:
        return (
          <div>
            This service is not being deployed right now and thus no deployment logs are available.
            <p>
              You can access the application logs from the{' '}
              <Link
                className="link text-accent2-500 mr-1"
                size="text-base"
                link={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId)}
                linkLabel="Live logs"
              />
              tab.
            </p>
          </div>
        )
    }
  }

  return (
    <LayoutLogs
      data={{
        items: hideDeploymentLogs ? [] : logs,
        loadingStatus: hideDeploymentLogs ? 'loaded' : loadingStatus,
      }}
      placeholderDescription={displayPlaceholder(serviceDeploymentStatus)}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      serviceRunningStatus={serviceRunningStatus}
      errors={errors}
      withLogsNavigation
      lineNumbers
    >
      <div className="pb-8">{memoRow}</div>
    </LayoutLogs>
  )
}

export default DeploymentLogs

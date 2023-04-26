import { EnvironmentLogs, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { LoadingStatus, ServiceRunningStatus } from '@qovery/shared/interfaces'
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
  serviceRunningStatus?: ServiceRunningStatus
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
        return 'This service has never been deployed and thus no logs are available.'
      default:
        return (
          <div>
            No Deployment Logs available for this service.
            <p>
              Deployment Logs are available only for services deployed during the last deployment execution (
              <a className="text-brand-400">in purple</a> within the list on the left).
            </p>
            <p>
              You can still access the application logs from the{' '}
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

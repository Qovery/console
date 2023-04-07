import { EnvironmentLogs, StateEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { LoadingStatus } from '@qovery/shared/interfaces'
import RowDeployment from '../row-deployment/row-deployment'

export interface DeploymentLogsProps {
  loadingStatus: LoadingStatus
  logs: EnvironmentLogs[]
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  errors: ErrorLogsProps[]
  hideDeploymentLogs: boolean
  applicationStatus?: StateEnum
}

export function DeploymentLogs(props: DeploymentLogsProps) {
  const { logs, errors, hideDeploymentLogs, pauseStatusLogs, setPauseStatusLogs, applicationStatus, loadingStatus } =
    props

  const memoRow = useMemo(
    () => logs?.map((log: EnvironmentLogs, index: number) => <RowDeployment key={index} index={index} data={log} />),
    [logs]
  )

  return (
    <LayoutLogs
      data={{
        items: hideDeploymentLogs ? [] : logs,
        loadingStatus: hideDeploymentLogs ? 'loaded' : loadingStatus,
      }}
      placeholderDescription="This service is not being deployed right now"
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      applicationStatus={applicationStatus}
      errors={errors}
      withLogsNavigation
      lineNumbers
    >
      <div className="pb-8">{memoRow}</div>
    </LayoutLogs>
  )
}

export default DeploymentLogs

import { DeploymentHistoryEnvironment, EnvironmentLogs, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { DeploymentService, LoadingStatus, ServiceRunningStatus } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { LoaderSpinner, StatusChip } from '@qovery/shared/ui'
import { dateFullFormat, mergeDeploymentServices, trimId } from '@qovery/shared/utils'
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
  serviceName?: string
  dataDeploymentHistory?: DeploymentHistoryEnvironment[]
}

export function DeploymentLogs({
  logs,
  errors,
  hideDeploymentLogs,
  pauseStatusLogs,
  setPauseStatusLogs,
  serviceRunningStatus,
  serviceDeploymentStatus,
  loadingStatus,
  serviceName,
  dataDeploymentHistory,
}: DeploymentLogsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '', versionId = '' } = useParams()

  const memoRow = useMemo(
    () => logs?.map((log: EnvironmentLogs, index: number) => <RowDeployment key={index} index={index} data={log} />),
    [logs]
  )

  const deploymentsByServiceId = mergeDeploymentServices(dataDeploymentHistory).filter(
    (deploymentHistory) => deploymentHistory.id === serviceId
  )

  const displayPlaceholder = (serviceDeploymentStatus?: ServiceDeploymentStatusEnum) => {
    if (hideDeploymentLogs) {
      if (
        serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ||
        deploymentsByServiceId.length === 0
      ) {
        return (
          <div>
            <p className="mb-1">
              No logs on this execution for <span className="text-brand-400">{serviceName}</span>.
            </p>
            <p className="text-zinc-300 font-normal text-sm">
              This service was deployed more than 30 days and thus no deployment logs are available.
            </p>
          </div>
        )
      } else if (logs.length === 0 && loadingStatus !== 'not loaded' && !serviceDeploymentStatus) {
        return <LoaderSpinner className="w-6 h-6" theme="dark" />
      } else {
        return (
          <div className="flex items-center flex-col">
            <div>
              <p className="mb-1">
                <span className="text-brand-400">{serviceName}</span> service was not deployed within this deployment
                execution.
              </p>
              <p className="text-zinc-300 font-normal text-sm mb-10">
                Below the list of executions where this service was deployed.
              </p>
            </div>
            <div className="bg-element-light-darker-500 border border-zinc-500 rounded-lg overflow-hidden w-[484px]">
              <div className="py-3 bg-element-light-darker-300 border-b border-zinc-500">Last deployment logs</div>
              <div className="overflow-y-auto max-h-96 p-2">
                {deploymentsByServiceId?.map((deploymentHistory: DeploymentService) => (
                  <div key={deploymentHistory.execution_id} className="flex items-center pb-2 last:pb-0">
                    <Link
                      className={`flex justify-between transition bg-element-light-darker-200 hover:bg-element-light-darker-300 w-full p-3 rounded ${
                        versionId === deploymentHistory.execution_id ? 'bg-element-light-darker-300' : ''
                      }`}
                      to={
                        ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                        DEPLOYMENT_LOGS_VERSION_URL(serviceId, deploymentHistory.execution_id)
                      }
                    >
                      <span className="flex">
                        <StatusChip className="mr-3 relative top-[2px]" status={deploymentHistory.status} />
                        <span className="text-brand-300 text-ssm">{trimId(deploymentHistory.execution_id || '')}</span>
                      </span>
                      <span className="text-zinc-300 text-ssm">{dateFullFormat(deploymentHistory.created_at)}</span>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center bg-element-light-darker-300 h-9 border-t border-zinc-500">
                <p className="text-zinc-350 text-xs font-normal">
                  Only the last 20 deployments of the environment over the last 30 days are available.
                </p>
              </div>
            </div>
          </div>
        )
      }
    }

    return <LoaderSpinner className="w-6 h-6" theme="dark" />
  }

  return (
    <LayoutLogs
      data={{
        items: hideDeploymentLogs ? [] : logs,
        loadingStatus,
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

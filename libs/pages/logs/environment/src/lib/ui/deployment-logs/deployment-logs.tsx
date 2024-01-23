import {
  type DeploymentHistoryEnvironment,
  type EnvironmentLogs,
  type ServiceDeploymentStatusEnum,
  type Status,
} from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { type DeploymentService, type LoadingStatus } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, StatusChip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { mergeDeploymentServices, trimId } from '@qovery/shared/util-js'
import RowDeployment from '../row-deployment/row-deployment'

export interface DeploymentLogsProps {
  loadingStatus: LoadingStatus
  logs: EnvironmentLogs[]
  pauseStatusLogs: boolean
  setPauseStatusLogs: (pause: boolean) => void
  errors: ErrorLogsProps[]
  hideDeploymentLogs?: boolean
  serviceDeploymentStatus?: ServiceDeploymentStatusEnum
  dataDeploymentHistory?: DeploymentHistoryEnvironment[]
  service?: AnyService
  serviceStatus: Status
  isDeploymentProgressing?: boolean
  setShowPreviousLogs?: (showPreviousLogs: boolean) => void
  showPreviousLogs?: boolean
}

export function DeploymentLogs({
  logs,
  errors,
  hideDeploymentLogs,
  pauseStatusLogs,
  setPauseStatusLogs,
  loadingStatus,
  dataDeploymentHistory,
  service,
  serviceStatus: { service_deployment_status: serviceDeploymentStatus, state: serviceState },
  isDeploymentProgressing,
  setShowPreviousLogs,
  showPreviousLogs,
}: DeploymentLogsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '', versionId = '' } = useParams()

  const memoRow = useMemo(
    () =>
      logs
        // Hide Environment deployment error if selected service is the one in error
        .filter(({ details: { transmitter, stage } }) =>
          transmitter?.type === 'Environment' && stage?.step === 'DeployedError'
            ? serviceState !== 'DEPLOYMENT_ERROR'
            : true
        )
        .map((log: EnvironmentLogs, index: number) => <RowDeployment key={index} index={index} data={log} />),
    [logs, serviceDeploymentStatus]
  )

  const deploymentsByServiceId = mergeDeploymentServices(dataDeploymentHistory).filter(
    (deploymentHistory) => deploymentHistory.id === serviceId
  )

  const placeholderDeploymentHistory = deploymentsByServiceId.length !== 0 && (
    <div className="flex items-center flex-col text-center">
      <div>
        <p className="mb-1 text-neutral-50 font-text-neutral-50 font-medium">
          <span className="text-brand-400">{service?.name}</span> service was not deployed within this deployment
          execution.
        </p>
        <p className="text-neutral-300 font-normal text-sm mb-10">
          Below the list of executions where this service was deployed.
        </p>
      </div>
      <div className="bg-neutral-700 border border-neutral-500 rounded-lg overflow-hidden w-[484px]">
        <div className="py-3 text-neutral-50 bg-neutral-600 border-b border-neutral-500 font-medium">
          Last deployment logs
        </div>
        <div className="overflow-y-auto max-h-96 p-2">
          {deploymentsByServiceId?.map((deploymentHistory: DeploymentService) => (
            <div key={deploymentHistory.execution_id} className="flex items-center pb-2 last:pb-0">
              <Link
                className={`flex justify-between transition bg-neutral-550 hover:bg-neutral-600 w-full p-3 rounded ${
                  versionId === deploymentHistory.execution_id ? 'bg-neutral-600' : ''
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
                <span className="text-neutral-300 text-ssm">{dateFullFormat(deploymentHistory.created_at)}</span>
              </Link>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center bg-neutral-600 h-9 border-t border-neutral-500">
          <p className="text-neutral-350 text-xs font-normal">
            Only the last 20 deployments of the environment over the last 30 days are available.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <LayoutLogs
      type="deployment"
      data={{
        items: logs,
        hideLogs: hideDeploymentLogs,
        loadingStatus,
      }}
      customPlaceholder={placeholderDeploymentHistory}
      pauseLogs={pauseStatusLogs}
      setPauseLogs={setPauseStatusLogs}
      errors={errors}
      service={service}
      serviceDeploymentStatus={serviceDeploymentStatus}
      isProgressing={isDeploymentProgressing}
      progressingMsg="Streaming deployment logs"
      withLogsNavigation
      lineNumbers
    >
      {logs.length >= 500 && showPreviousLogs === false && (
        <button
          type="button"
          className="block py-1.5 bg-neutral-500 hover:bg-neutral-600 transition text-neutral-250 text-center text-sm font-medium w-full"
          onClick={() => setShowPreviousLogs?.(true)}
        >
          Load previous logs
          <Icon name={IconAwesomeEnum.ARROW_UP} className="ml-1.5" />
        </button>
      )}
      <div className="pb-8">{memoRow}</div>
    </LayoutLogs>
  )
}

export default DeploymentLogs

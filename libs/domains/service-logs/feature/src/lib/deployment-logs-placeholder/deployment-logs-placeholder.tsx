import { type DeploymentHistoryEnvironmentV2, ServiceDeploymentStatusEnum, type Status } from 'qovery-typescript-axios'
import { Link, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { type DeploymentService } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { StatusChip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { mergeDeploymentServices, trimId } from '@qovery/shared/util-js'
import { LoaderPlaceholder } from '../service-logs-placeholder/service-logs-placeholder'

function DeploymentHistoryPlaceholder({
  serviceName,
  deploymentsByServiceId,
}: {
  serviceName: string
  deploymentsByServiceId: DeploymentService[]
}) {
  const { organizationId = '', projectId = '', environmentId = '', versionId = '' } = useParams()

  return (
    <div className="flex flex-col items-center text-center">
      <div>
        <p className="font-text-neutral-50 mb-1 font-medium text-neutral-50">
          <span className="text-brand-400">{serviceName}</span> service was not deployed within this deployment
          execution.
        </p>
        <p className="mb-10 text-sm font-normal text-neutral-300">
          Below the list of executions where this service was deployed.
        </p>
      </div>
      <div className="w-[484px] overflow-hidden rounded-lg border border-neutral-500 bg-neutral-700">
        <div className="border-b border-neutral-500 bg-neutral-600 py-3 font-medium text-neutral-50">
          Last deployment logs
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {deploymentsByServiceId.length > 0 ? (
            deploymentsByServiceId.map((deploymentHistory: DeploymentService) => (
              <div key={deploymentHistory.execution_id} className="flex items-center pb-2 last:pb-0">
                <Link
                  className={`flex w-full justify-between rounded bg-neutral-550 p-3 transition hover:bg-neutral-600 ${
                    versionId === deploymentHistory.execution_id ? 'bg-neutral-600' : ''
                  }`}
                  to={
                    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                    DEPLOYMENT_LOGS_VERSION_URL(deploymentHistory.identifier.service_id, deploymentHistory.execution_id)
                  }
                >
                  <span className="flex">
                    <StatusChip className="relative top-[2px] mr-3" status={deploymentHistory.status} />
                    <span className="text-ssm text-brand-300">{trimId(deploymentHistory.execution_id || '')}</span>
                  </span>
                  <span className="text-ssm text-neutral-300">
                    {dateFullFormat(deploymentHistory.auditing_data.created_at)}
                  </span>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-50">No history deployment available for this service.</p>
          )}
        </div>
        <div className="flex h-9 items-center justify-center border-t border-neutral-500 bg-neutral-600">
          <p className="text-xs font-normal text-neutral-350">
            Only the last 20 deployments of the environment over the last 30 days are available.
          </p>
        </div>
      </div>
    </div>
  )
}

export interface DeploymentLogsPlaceholderProps {
  serviceStatus?: Status
  itemsLength?: number
  deploymentHistoryEnvironment?: DeploymentHistoryEnvironmentV2[]
}

export function DeploymentLogsPlaceholder({
  serviceStatus,
  itemsLength,
  deploymentHistoryEnvironment,
}: DeploymentLogsPlaceholderProps) {
  const { environmentId = '', serviceId = '' } = useParams()

  const { service_deployment_status: serviceDeploymentStatus, is_part_last_deployment: isPartLastDeployment } =
    serviceStatus || {}

  const { data: service } = useService({ environmentId, serviceId })
  const hideLogs = !isPartLastDeployment

  const outOfDateOrUpToDate =
    serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ||
    serviceDeploymentStatus === ServiceDeploymentStatusEnum.UP_TO_DATE

  const displaySpinner = match({ itemsLength, hideLogs, serviceDeploymentStatus, service })
    .with(
      {
        itemsLength: 0,
        hideLogs: false,
        serviceDeploymentStatus: undefined,
        service: undefined,
      },
      () => true
    )
    .otherwise(() => false)

  const deploymentsByServiceId = mergeDeploymentServices(deploymentHistoryEnvironment).filter(
    (deploymentHistory) => deploymentHistory.identifier.service_id === serviceId
  )

  if (displaySpinner) {
    return <LoaderPlaceholder />
  }

  if (hideLogs && service) {
    if (deploymentsByServiceId.length === 0 && outOfDateOrUpToDate) {
      return (
        <div className="flex flex-col items-center">
          <p className="mb-1 font-medium text-neutral-50">
            No logs on this execution for <span className="text-brand-400">{service.name}</span>.
          </p>
          {serviceDeploymentStatus !== ServiceDeploymentStatusEnum.NEVER_DEPLOYED && (
            <p className="text-sm font-normal text-neutral-300">
              This service was deployed more than 30 days ago and thus no deployment logs are available.
            </p>
          )}
        </div>
      )
    }

    return <DeploymentHistoryPlaceholder serviceName={service.name} deploymentsByServiceId={deploymentsByServiceId} />
  }

  return <LoaderPlaceholder />
}

export default DeploymentLogsPlaceholder

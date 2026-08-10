import { useQuery } from '@tanstack/react-query'
import { type DeploymentHistoryEnvironmentV2, type Status } from 'qovery-typescript-axios'
import { type AnyService, isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { type ServiceStatuses } from '@qovery/shared/interfaces'
import { mergeDeploymentServices } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { formatDeploymentStatusLabel, getServiceRunningStatus } from './service-status-utils'

export interface UseDeploymentFullStatusProps {
  environmentId?: string
  service?: AnyService
}

export function getAgenticWorkflowDeploymentStatus(
  deploymentHistory: DeploymentHistoryEnvironmentV2[],
  serviceId: string
): Status | undefined {
  const lastDeployment = mergeDeploymentServices(deploymentHistory).find(
    ({ identifier }) => identifier.service_id === serviceId
  )

  if (!lastDeployment) return undefined

  return {
    id: serviceId,
    execution_id: lastDeployment.execution_id,
    last_deployment_date: lastDeployment.auditing_data.created_at,
    state: lastDeployment.status,
    status_details: lastDeployment.status_details,
  } as Status
}

export function useServiceDeploymentAndRunningStatuses({ environmentId = '', service }: UseDeploymentFullStatusProps) {
  const serviceId = service?.id ?? ''

  const { data: runningStatus } = useQuery({
    ...queries.services.runningStatus(environmentId, serviceId),
  })

  const { data: deploymentStatus } = useQuery({
    ...queries.services.deploymentStatus(environmentId, serviceId),
  })

  const { data: agenticWorkflowDeploymentStatus } = useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId, pageSize: 100 }),
    select: (deploymentHistory) => getAgenticWorkflowDeploymentStatus(deploymentHistory ?? [], serviceId),
    enabled: Boolean(environmentId) && Boolean(serviceId) && isAgenticWorkflow(service),
  })

  const resolvedDeploymentStatus = deploymentStatus ?? agenticWorkflowDeploymentStatus

  const deploymentStatusLabel = formatDeploymentStatusLabel(resolvedDeploymentStatus)
  const runningStatusOverride = getServiceRunningStatus({
    service,
    runningStatus,
    deploymentStatus: resolvedDeploymentStatus,
  })

  const data: ServiceStatuses = {
    runningStatus: runningStatusOverride,
    ...(resolvedDeploymentStatus
      ? {
          deploymentStatus: {
            ...resolvedDeploymentStatus,
            stateLabel: deploymentStatusLabel,
          },
        }
      : {}),
  }

  return {
    data,
  }
}

export default useServiceDeploymentAndRunningStatuses

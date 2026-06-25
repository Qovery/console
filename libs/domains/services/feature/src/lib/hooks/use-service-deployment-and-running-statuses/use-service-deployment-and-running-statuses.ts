import { useQuery } from '@tanstack/react-query'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type ServiceStatuses } from '@qovery/shared/interfaces'
import { queries } from '@qovery/state/util-queries'
import { formatDeploymentStatusLabel, getServiceRunningStatus } from './service-status-utils'

export interface UseDeploymentFullStatusProps {
  environmentId?: string
  service?: AnyService
}

export function useServiceDeploymentAndRunningStatuses({ environmentId = '', service }: UseDeploymentFullStatusProps) {
  const serviceId = service?.id ?? ''

  const { data: runningStatus } = useQuery({
    ...queries.services.runningStatus(environmentId, serviceId),
  })

  const { data: deploymentStatus } = useQuery({
    ...queries.services.deploymentStatus(environmentId, serviceId),
  })

  const deploymentStatusLabel = formatDeploymentStatusLabel(deploymentStatus)
  const runningStatusOverride = getServiceRunningStatus({ service, runningStatus, deploymentStatus })

  const data: ServiceStatuses = {
    runningStatus: runningStatusOverride,
    ...(deploymentStatus
      ? {
          deploymentStatus: {
            ...deploymentStatus,
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

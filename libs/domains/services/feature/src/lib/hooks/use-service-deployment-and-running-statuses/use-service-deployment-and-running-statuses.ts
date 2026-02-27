import { useQuery } from '@tanstack/react-query'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type ServiceRunningStatus, type ServiceStatuses } from '@qovery/shared/interfaces'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentFullStatusProps {
  environmentId?: string
  service?: AnyService
}

export function useServiceDeploymentAndRunningStatuses({
  environmentId: envId,
  service,
}: UseDeploymentFullStatusProps) {
  const serviceId = service?.id ?? ''
  const environmentId = envId ?? ''
  const { data: runningStatus } = useQuery({
    ...queries.services.runningStatus(environmentId, serviceId),
  })

  const { data: deploymentStatus } = useQuery({
    ...queries.services.deploymentStatus(environmentId, serviceId),
  })

  const deploymentStatusLabel = upperCaseFirstLetter(
    (deploymentStatus?.state === 'READY' ? 'NEVER_DEPLOYED' : deploymentStatus?.state)?.replace('_', ' ') ?? 'STOPPED'
  )
  const runningStatusLabel = upperCaseFirstLetter(runningStatus?.state.replace('_', ' ') ?? 'STOPPED')
  const isManagedDb = service?.serviceType === 'DATABASE' && service.mode === 'MANAGED'
  const runningStatusOverride: ServiceRunningStatus = match({ runningStatus, isManagedDb })
    .with({ runningStatus: P.any, isManagedDb: true }, () => ({
      triggered_action: undefined,
      ...deploymentStatus,
      state: match(deploymentStatus?.state)
        .with('DEPLOYED', () => 'RUNNING' as const)
        .otherwise(() => 'UNKNOWN' as const),
      stateLabel: match(deploymentStatus?.state)
        .with('DEPLOYED', () => 'Running')
        .otherwise(() => 'Unknown'),
    }))
    .with({ runningStatus: P.nullish, isManagedDb: false }, () => ({
      state: undefined,
      stateLabel: undefined,
      triggered_action: undefined,
    }))
    .with({ runningStatus: P.not(P.nullish) }, ({ runningStatus }) => ({
      triggered_action: undefined, // will be unpacked from runningStatus if present
      ...runningStatus,
      stateLabel: runningStatusLabel,
    }))
    .exhaustive()

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

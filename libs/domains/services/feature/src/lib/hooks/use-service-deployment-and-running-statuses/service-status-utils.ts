import { type Status } from 'qovery-typescript-axios'
import { type ServiceStateDto } from 'qovery-ws-typescript-axios'
import { P, match } from 'ts-pattern'
import { type AnyService, isManagedDatabase } from '@qovery/domains/services/data-access'
import { type ServiceRunningStatus } from '@qovery/shared/interfaces'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

type ServiceListStatus = Status['state'] | ServiceRunningStatus['state'] | 'SKIPPED'
type ServiceWithStatuses = AnyService & {
  deploymentStatus?: Pick<Status, 'state'> | null
  runningStatus?: { state?: ServiceRunningStatus['state'] } | null
}

export function formatDeploymentStatusLabel(deploymentStatus?: Status | null) {
  return upperCaseFirstLetter(
    (deploymentStatus?.state === 'READY' ? 'NEVER_DEPLOYED' : deploymentStatus?.state)?.replace('_', ' ') ?? 'STOPPED'
  )
}

export function formatRunningStatusLabel(state?: ServiceStateDto) {
  return upperCaseFirstLetter(state?.replace('_', ' ') ?? 'STOPPED')
}

function hasPreviousDeployment(deploymentStatus?: Status | null) {
  return Boolean(deploymentStatus?.last_deployment_date || deploymentStatus?.execution_id)
}

export function getServiceListStatus(service: ServiceWithStatuses): ServiceListStatus {
  return (
    service.runningStatus?.state ??
    match(service)
      .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => service.deploymentStatus?.state)
      .otherwise(() => service.runningStatus?.state)
  )
}

export function getManagedDatabaseRunningStatus(deploymentStatus?: Status | null): ServiceRunningStatus {
  return {
    triggered_action: undefined,
    ...deploymentStatus,
    state: match(deploymentStatus?.state)
      .with('DEPLOYED', () => 'RUNNING' as const)
      .with('READY', () => (hasPreviousDeployment(deploymentStatus) ? ('RUNNING' as const) : ('UNKNOWN' as const)))
      .with('STOPPED', () => 'STOPPED' as const)
      .otherwise(() => 'UNKNOWN' as const),
    stateLabel: match(deploymentStatus?.state)
      .with('DEPLOYED', () => 'Running')
      .with('READY', () => (hasPreviousDeployment(deploymentStatus) ? 'Running' : 'Unknown'))
      .with('STOPPED', () => 'Stopped')
      .otherwise(() => 'Unknown'),
  }
}

export function getServiceRunningStatus({
  service,
  runningStatus,
  deploymentStatus,
}: {
  service?: AnyService
  runningStatus?: { triggered_action?: ServiceRunningStatus['triggered_action']; state: ServiceStateDto } | null
  deploymentStatus?: Status | null
}): ServiceRunningStatus {
  const runningStatusLabel = formatRunningStatusLabel(runningStatus?.state)
  const isManagedDb = isManagedDatabase(service)

  return match({ runningStatus, isManagedDb })
    .with({ runningStatus: P.any, isManagedDb: true }, () => getManagedDatabaseRunningStatus(deploymentStatus))
    .with({ runningStatus: P.nullish, isManagedDb: false }, () => ({
      state: undefined,
      stateLabel: undefined,
      triggered_action: undefined,
    }))
    .with({ runningStatus: P.not(P.nullish) }, ({ runningStatus }) => ({
      triggered_action: undefined,
      ...runningStatus,
      stateLabel: runningStatusLabel,
    }))
    .exhaustive()
}

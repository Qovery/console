import { StatusChip, type StatusChipProps } from '@qovery/shared/ui'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'

export type ServiceStateChipProps = Omit<StatusChipProps, 'status'> &
  (
    | {
        environmentId?: string
        serviceId?: string
        mode: 'deployment'
      }
    | {
        environmentId?: string
        serviceId?: string
        mode: 'running'
        withDeploymentFallback?: boolean
      }
  )

type DeploymentStateChipProps = Omit<ServiceStateChipProps, 'mode'>

function DeploymentStateChip({ environmentId, serviceId, ...props }: DeploymentStateChipProps) {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })
  return <StatusChip status={deploymentStatus?.state ?? 'STOPPED'} {...props} />
}

interface RunningStateChipProps extends Omit<ServiceStateChipProps, 'mode'> {
  withDeploymentFallback?: boolean
}

function RunningStateChip({
  environmentId,
  serviceId,
  withDeploymentFallback = false,
  ...props
}: RunningStateChipProps) {
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })
  // NOTE: Some services don't have a live/running status like managed DB, we must fallback on the deployment status
  if (withDeploymentFallback && !runningStatus?.state) {
    return <DeploymentStateChip environmentId={environmentId} serviceId={serviceId} {...props} />
  }
  return (
    <StatusChip
      status={runningStatus?.state ?? 'STOPPED'}
      appendTooltipMessage={runningStatus?.state === 'ERROR' ? runningStatus?.pods[0]?.state_message : ''}
      {...props}
    />
  )
}

export function ServiceStateChip({ mode, ...props }: ServiceStateChipProps) {
  return mode === 'deployment' ? <DeploymentStateChip {...props} /> : <RunningStateChip {...props} />
}

export default ServiceStateChip

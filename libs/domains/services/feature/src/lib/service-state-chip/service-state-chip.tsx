import { RunningState } from '@qovery/shared/enums'
import { StatusChip, type StatusChipProps } from '@qovery/shared/ui'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'

export interface ServiceStateChipProps extends Omit<StatusChipProps, 'status'> {
  environmentId?: string
  serviceId?: string
  mode: 'deployment' | 'running'
}

type DeploymentStateChipProps = Omit<ServiceStateChipProps, 'mode'>

function DeploymentStateChip({ environmentId, serviceId, ...props }: DeploymentStateChipProps) {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })
  return <StatusChip status={deploymentStatus?.state ?? 'STOPPED'} {...props} />
}

type RunningStateChipProps = Omit<ServiceStateChipProps, 'mode'>

function RunningStateChip({ environmentId, serviceId, ...props }: RunningStateChipProps) {
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })
  return (
    <StatusChip
      status={runningStatus?.state ?? 'STOPPED'}
      appendTooltipMessage={runningStatus?.state === RunningState.ERROR ? runningStatus?.pods[0]?.state_message : ''}
      {...props}
    />
  )
}

export function ServiceStateChip({ mode, ...props }: ServiceStateChipProps) {
  return mode === 'deployment' ? <DeploymentStateChip {...props} /> : <RunningStateChip {...props} />
}

export default ServiceStateChip

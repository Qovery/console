import { StatusChip, type StatusChipProps } from '@qovery/shared/ui'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'

export interface EnvironmentStateChipProps extends Omit<StatusChipProps, 'status'> {
  environmentId?: string
  mode: 'deployment' | 'running'
}

type DeploymentStateChipProps = Omit<EnvironmentStateChipProps, 'mode'>

function DeploymentStateChip({ environmentId, ...props }: DeploymentStateChipProps) {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId })
  return <StatusChip status={deploymentStatus?.state} {...props} />
}

type RunningStateChipProps = Omit<EnvironmentStateChipProps, 'mode'>

function RunningStateChip({ environmentId, ...props }: RunningStateChipProps) {
  const { data: runningStatus } = useRunningStatus({ environmentId })
  return <StatusChip status={runningStatus?.state} {...props} />
}

export function EnvironmentStateChip({ mode, ...props }: EnvironmentStateChipProps) {
  return mode === 'deployment' ? <DeploymentStateChip {...props} /> : <RunningStateChip {...props} />
}

export default EnvironmentStateChip

import { Skeleton, StatusChip, type StatusChipProps } from '@qovery/shared/ui'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'

/**
 * Difference between `deployment` and `last-deployment`:
 *
 * The `state` variable is used to determine the status of the current deployment.
 * The `lastDeploymentState` variable is used to store the status of the last deployment.
 *
 * Condition from the API:
 * state = deployment.currentStatus.toState()
 * lastDeploymentState = deployment.deploymentStatus?.toState() ?: deployment.currentStatus.toState()
 *
 * When the deployment is terminated, the `currentStatus` represents the status for the entire environment.
 * This means that if a single service is triggered while there was a previous deployment failure,
 * the `currentStatus` will be in error even if the deployment of the single service was successful.
 * To avoid losing the knowledge of whether the last deployment was a success or failure,
 * we store it in the `lastDeploymentState` field.
 */

export interface EnvironmentStateChipProps extends Omit<StatusChipProps, 'status'> {
  mode: 'running' | 'deployment' | 'last-deployment'
  environmentId?: string
}

type DeploymentStateChipProps = Omit<EnvironmentStateChipProps, 'mode'> & { mode: 'deployment' | 'last-deployment' }

function DeploymentStateChip({ environmentId, mode, ...props }: DeploymentStateChipProps) {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId })

  if (mode === 'last-deployment') {
    return (
      <Skeleton width={16} height={16} show={!deploymentStatus?.last_deployment_state} rounded>
        <StatusChip status={deploymentStatus?.last_deployment_state} {...props} />
      </Skeleton>
    )
  }

  return <StatusChip status={deploymentStatus?.state ?? 'STOPPED'} {...props} />
}

type RunningStateChipProps = Omit<EnvironmentStateChipProps, 'mode'>

function RunningStateChip({ environmentId, ...props }: RunningStateChipProps) {
  const { data: runningStatus } = useRunningStatus({ environmentId })
  return <StatusChip status={runningStatus?.state ?? 'STOPPED'} {...props} />
}

export function EnvironmentStateChip({ mode, ...props }: EnvironmentStateChipProps) {
  return mode === 'running' ? <RunningStateChip {...props} /> : <DeploymentStateChip mode={mode} {...props} />
}

export default EnvironmentStateChip

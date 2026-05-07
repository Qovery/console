import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { LiveElapsedDuration } from '@qovery/shared/console-shared'
import { Icon } from '@qovery/shared/ui'
import { formatDuration } from '@qovery/shared/util-dates'

type EnvDeploymentStatus = DeploymentHistoryEnvironmentV2['status']

const QUEUED_STATUSES: EnvDeploymentStatus[] = [
  'QUEUED',
  'DEPLOYMENT_QUEUED',
  'DELETE_QUEUED',
  'STOP_QUEUED',
  'RESTART_QUEUED',
]

const IN_PROGRESS_STATUSES: EnvDeploymentStatus[] = [
  'DEPLOYING',
  'RESTARTING',
  'BUILDING',
  'DELETING',
  'CANCELING',
  'STOPPING',
]

export interface EnvironmentDeploymentDurationCellProps {
  status: EnvDeploymentStatus
  totalDuration?: string
  createdAt?: string
}

export function EnvironmentDeploymentDurationCell({
  status,
  totalDuration,
  createdAt,
}: EnvironmentDeploymentDurationCellProps) {
  if (QUEUED_STATUSES.includes(status)) {
    return <span className="text-neutral-subtle">--</span>
  }

  if (IN_PROGRESS_STATUSES.includes(status) && createdAt) {
    return <LiveElapsedDuration createdAt={createdAt} />
  }

  if (totalDuration) {
    return (
      <span className="flex items-center gap-1 text-neutral-subtle">
        <Icon iconName="clock-eight" iconStyle="regular" />
        {formatDuration(totalDuration)}
      </span>
    )
  }

  return <span className="text-neutral-subtle">--</span>
}

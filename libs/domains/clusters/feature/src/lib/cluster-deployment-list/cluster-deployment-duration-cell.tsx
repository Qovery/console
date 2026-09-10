import { type DeploymentHistoryActionStatus } from 'qovery-typescript-axios'
import { LiveElapsedDuration } from '@qovery/shared/console-shared'
import { Icon } from '@qovery/shared/ui'
import { formatDuration } from '@qovery/shared/util-dates'

const IN_PROGRESS_STATUSES: DeploymentHistoryActionStatus[] = ['ONGOING', 'CANCELING', 'EXECUTING']

export interface ClusterDeploymentDurationCellProps {
  status?: DeploymentHistoryActionStatus
  totalDuration?: string
  createdAt?: string
}

export function ClusterDeploymentDurationCell({
  status,
  totalDuration,
  createdAt,
}: ClusterDeploymentDurationCellProps) {
  if (status === 'QUEUED' || status === 'NEVER') {
    return <span className="text-neutral-subtle">--</span>
  }

  if (status && IN_PROGRESS_STATUSES.includes(status) && createdAt) {
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

export default ClusterDeploymentDurationCell

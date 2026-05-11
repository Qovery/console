import { type DeploymentHistoryService } from 'qovery-typescript-axios'
import { LiveElapsedDuration } from '@qovery/shared/console-shared'
import { Icon } from '@qovery/shared/ui'
import { formatDuration } from '@qovery/shared/util-dates'

type DeploymentActionStatus = NonNullable<DeploymentHistoryService['status_details']>['status']

const IN_PROGRESS_STATUSES: DeploymentActionStatus[] = ['ONGOING', 'CANCELING']

export interface ServiceDeploymentDurationCellProps {
  status?: DeploymentActionStatus
  totalDuration?: string
  createdAt?: string
}

export function ServiceDeploymentDurationCell({
  status,
  totalDuration,
  createdAt,
}: ServiceDeploymentDurationCellProps) {
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

import { type EnvironmentStatus } from 'qovery-typescript-axios'
import { Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'

export interface SidebarStatusProps {
  environmentStatus?: EnvironmentStatus
}

export function SidebarStatus(props: SidebarStatusProps) {
  const { environmentStatus } = props

  return (
    <div className="border-b border-neutral-500 p-5">
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-300">
        Deployment status:
        <StatusChip status={environmentStatus?.last_deployment_state || environmentStatus?.state} />
      </div>
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-300">
        Deployment Execution id:
        <Tooltip content={environmentStatus?.last_deployment_id || ''}>
          <span className="text-brand-400">
            {environmentStatus?.last_deployment_id && environmentStatus?.last_deployment_id.length > 23
              ? `${environmentStatus?.last_deployment_id?.substring(
                  0,
                  8
                )}...${environmentStatus?.last_deployment_id?.slice(-8)}`
              : environmentStatus?.last_deployment_id}
          </span>
        </Tooltip>
      </div>
      {environmentStatus?.last_deployment_date && (
        <p className="flex items-center justify-between text-xs text-neutral-300">
          Deployment start time:
          <span className="text-neutral-50" title={dateUTCString(environmentStatus.last_deployment_date)}>
            {dateFullFormat(environmentStatus.last_deployment_date)}
          </span>
        </p>
      )}
      <p className="mt-2 flex items-center justify-between text-xs text-neutral-300">
        Parallel Deployment:
        <span className="flex text-neutral-50">
          7{' '}
          <Tooltip side="right" content="Number of services deployed in parallel on each pipeline stage">
            <span className="flex items-center">
              <Icon className="ml-1 cursor-pointer text-xs text-neutral-300" name="icon-solid-circle-info" />
            </span>
          </Tooltip>
        </span>
      </p>
    </div>
  )
}

export default SidebarStatus

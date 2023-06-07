import { EnvironmentStatus } from 'qovery-typescript-axios'
import { Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export interface SidebarStatusProps {
  environmentStatus?: EnvironmentStatus
}

export function SidebarStatus(props: SidebarStatusProps) {
  const { environmentStatus } = props

  return (
    <div className="border-b border-element-light-darker-100 p-5">
      <div className="flex items-center justify-between text-text-300 text-xs mb-2">
        Deployment status:
        <StatusChip status={environmentStatus?.last_deployment_state || environmentStatus?.state} />
      </div>
      <p className="flex items-center justify-between text-text-300 text-xs mb-2">
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
      </p>
      {environmentStatus?.last_deployment_date && (
        <p className="flex items-center justify-between text-text-300 text-xs">
          Deployment start time:
          <span className="text-text-100">{dateFullFormat(environmentStatus?.last_deployment_date || '')}</span>
        </p>
      )}
      <p className="flex items-center justify-between text-text-300 text-xs mt-2">
        Parallel Deployment:
        <span className="flex text-text-100">
          4{' '}
          <Tooltip side="right" content="Number of services deployed in parallel on each pipeline stage">
            <div className="flex items-center">
              <Icon className="cursor-pointer ml-1 text-xs text-element-light-text-300" name="icon-solid-circle-info" />
            </div>
          </Tooltip>
        </span>
      </p>
    </div>
  )
}

export default SidebarStatus

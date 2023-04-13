import { DeploymentHistoryEnvironment, EnvironmentStatus } from 'qovery-typescript-axios'
import { StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export interface SidebarStatusProps {
  environmentDeploymentHistory?: DeploymentHistoryEnvironment
  environmentStatus?: EnvironmentStatus
}

export function SidebarStatus(props: SidebarStatusProps) {
  const { environmentDeploymentHistory, environmentStatus } = props

  return (
    <div className="border-b border-element-light-darker-100 p-5">
      <p className="flex items-center justify-between text-text-300 text-xs mb-2">
        Pipeline deployment status:
        <StatusChip status={environmentStatus?.last_deployment_state || environmentStatus?.state} />
      </p>
      <p className="flex items-center justify-between text-text-300 text-xs mb-2">
        Deployment id:
        <Tooltip content={environmentDeploymentHistory?.id || ''}>
          <span className="text-brand-400">
            {environmentDeploymentHistory?.id && environmentDeploymentHistory?.id.length > 23
              ? `${environmentDeploymentHistory?.id?.substring(0, 8)}...${environmentDeploymentHistory?.id?.slice(-8)}`
              : environmentDeploymentHistory?.id}
          </span>
        </Tooltip>
      </p>
      {environmentStatus?.last_deployment_date && (
        <p className="flex items-center justify-between text-text-300 text-xs">
          Deployment start time:
          <span className="text-text-100">{dateFullFormat(environmentStatus?.last_deployment_date || '')}</span>
        </p>
      )}
    </div>
  )
}

export default SidebarStatus

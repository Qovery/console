import { DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
import { StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/utils'

export interface SidebarStatusProps {
  environmentDeploymentHistory?: DeploymentHistoryEnvironment
}

export function SidebarStatus(props: SidebarStatusProps) {
  const { environmentDeploymentHistory } = props

  return (
    <div className="border-b border-element-light-darker-100 p-5">
      <p className="flex items-center justify-between text-text-300 text-xs mb-2">
        Pipeline deployment status:
        <StatusChip status={environmentDeploymentHistory?.status} />
      </p>
      <p className="flex items-center justify-between text-text-300 text-xs mb-2">
        Deployment id:
        <Tooltip content={environmentDeploymentHistory?.id || ''}>
          <span className="text-brand-400">
            {environmentDeploymentHistory?.id && environmentDeploymentHistory?.id.length > 23
              ? `${environmentDeploymentHistory?.id?.substring(0, 10)}...${environmentDeploymentHistory?.id?.slice(
                  -10
                )}`
              : environmentDeploymentHistory?.id}
          </span>
        </Tooltip>
      </p>
      <p className="flex items-center justify-between text-text-300 text-xs">
        Deployment start time:
        {environmentDeploymentHistory?.updated_at && (
          <span className="text-text-100">{dateFullFormat(environmentDeploymentHistory.updated_at)}</span>
        )}
      </p>
    </div>
  )
}

export default SidebarStatus

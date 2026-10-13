import { ClusterDeploymentHistoryOperationEnum } from 'qovery-typescript-axios'
import { type ComponentProps } from 'react'
import { DeploymentAction, Tooltip } from '@qovery/shared/ui'

export interface ClusterDeploymentActionProps {
  status: ComponentProps<typeof DeploymentAction>['status']
  operation?: ClusterDeploymentHistoryOperationEnum
}

export function ClusterDeploymentAction({ status, operation }: ClusterDeploymentActionProps) {
  if (operation !== ClusterDeploymentHistoryOperationEnum.OPERATOR_UPDATE) {
    return <DeploymentAction status={status} />
  }

  return (
    <Tooltip content="Operator update">
      <div>
        <DeploymentAction status={status} label="Operator" />
      </div>
    </Tooltip>
  )
}

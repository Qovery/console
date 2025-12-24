import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { Banner } from '@qovery/shared/ui'

export interface ClusterNeedRedeployFlagProps {
  deploymentStatus?: ClusterDeploymentStatusEnum
  onClickButton: () => void
}

export function ClusterNeedRedeployFlag({ deploymentStatus, onClickButton }: ClusterNeedRedeployFlagProps) {
  const buttonLabel = (deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  return (
    <Banner color="yellow" buttonIconRight="rotate-right" buttonLabel={buttonLabel} onClickButton={onClickButton}>
      This cluster needs to be{' '}
      {deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'} to apply the
      configuration changes
    </Banner>
  )
}

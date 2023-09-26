import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { Banner, BannerStyle, IconAwesomeEnum } from '@qovery/shared/ui'

export interface NeedRedeployFlagProps {
  deploymentStatus?: ClusterDeploymentStatusEnum
  onClickButton: () => void
}

export function NeedRedeployFlag({ deploymentStatus, onClickButton }: NeedRedeployFlagProps) {
  const buttonLabel = (deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  return (
    <Banner
      bannerStyle={BannerStyle.WARNING}
      buttonIconRight={IconAwesomeEnum.ROTATE_RIGHT}
      buttonLabel={buttonLabel}
      onClickButton={onClickButton}
    >
      <p>
        This cluster needs to be{' '}
        {deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'} to apply the
        configuration changes
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

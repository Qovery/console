import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { Banner, BannerStyle, IconAwesomeEnum } from '@qovery/shared/ui'

export interface NeedRedeployFlagProps {
  application: ApplicationEntity
  onClickCTA?: () => void
}

export function NeedRedeployFlag(props: NeedRedeployFlagProps) {
  const buttonLabel =
    (props.application.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
      ? 'Redeploy'
      : 'Deploy') + ' now'

  return (
    <Banner
      bannerStyle={BannerStyle.WARNING}
      buttonIconRight={IconAwesomeEnum.ROTATE_RIGHT}
      buttonLabel={buttonLabel}
      onClickButton={props.onClickCTA}
    >
      <p>
        This application needs to be{' '}
        {props.application.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
          ? 'redeployed'
          : 'deployed'}{' '}
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { Banner, BannerStyle, IconAwesomeEnum } from '@qovery/shared/ui'

export interface NeedRedeployFlagProps {
  service: ApplicationEntity | DatabaseEntity
  onClickCTA?: () => void
}

export function NeedRedeployFlag(props: NeedRedeployFlagProps) {
  const buttonLabel =
    (props.service.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
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
        This service needs to be{' '}
        {props.service.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
          ? 'redeployed'
          : 'deployed'}{' '}
        to apply the configuration changes
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

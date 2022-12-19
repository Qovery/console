import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { isJob } from '@qovery/shared/enums'
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
        This {isJob(props.application) ? 'job' : 'application'} needs to be{' '}
        {props.application.status?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
          ? 'redeployed'
          : 'deployed'}{' '}
        to apply the configuration changes
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

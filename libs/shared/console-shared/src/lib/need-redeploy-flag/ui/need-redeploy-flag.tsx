import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { Banner, BannerStyle, IconAwesomeEnum } from '@qovery/shared/ui'

export interface NeedRedeployFlagProps {
  service: ApplicationEntity | DatabaseEntity
  onClickCTA?: () => void
}

export function NeedRedeployFlag(props: NeedRedeployFlagProps) {
  const { service } = props
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: service.environment?.id,
    serviceId: service.id,
  })

  const buttonLabel =
    (deploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') +
    ' now'

  return (
    <Banner
      bannerStyle={BannerStyle.WARNING}
      buttonIconRight={IconAwesomeEnum.ROTATE_RIGHT}
      buttonLabel={buttonLabel}
      onClickButton={props.onClickCTA}
    >
      <p>
        This service needs to be{' '}
        {deploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE
          ? 'redeployed'
          : 'deployed'}{' '}
        to apply the configuration changes
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

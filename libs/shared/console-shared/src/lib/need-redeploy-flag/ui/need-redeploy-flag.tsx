import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useDeployService, useDeploymentStatus, useRedeployService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner, IconAwesomeEnum } from '@qovery/shared/ui'

export interface NeedRedeployFlagProps {
  service: AnyService
  serviceDeploymentStatus: ServiceDeploymentStatusEnum
}

export function NeedRedeployFlag({ service, serviceDeploymentStatus }: NeedRedeployFlagProps) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const navigate = useNavigate()
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: service.environment?.id,
    serviceId: service.id,
  })

  const { mutate: deployService } = useDeployService({ environmentId: service.environment?.id })
  const { mutate: redeployService } = useRedeployService({ environmentId: service.environment?.id })

  const buttonLabel =
    (deploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') +
    ' now'

  const mutationDeployService = () => {
    if (service) {
      if (serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
        deployService({ serviceId: service.id, serviceType: service.serviceType })
      } else {
        redeployService({ serviceId: service.id, serviceType: service.serviceType })
      }
      navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId))
    }
  }

  return (
    <Banner
      color="yellow"
      buttonIconRight={IconAwesomeEnum.ROTATE_RIGHT}
      buttonLabel={buttonLabel}
      onClickButton={mutationDeployService}
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

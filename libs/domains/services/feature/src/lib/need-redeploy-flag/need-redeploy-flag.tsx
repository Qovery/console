import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useService } from '../hooks/use-service/use-service'

export function NeedRedeployFlag() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const navigate = useNavigate()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: serviceDeploymentStatus } = useDeploymentStatus({
    environmentId,
    serviceId: service?.id,
  })

  const serviceDeploymentStatusState =
    serviceDeploymentStatus?.service_deployment_status ?? ServiceDeploymentStatusEnum.NEVER_DEPLOYED

  const { mutate: deployService } = useDeployService({ environmentId })

  if (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.UP_TO_DATE) return null

  const buttonLabel =
    (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  const mutationDeployService = () => {
    if (service) {
      deployService({ serviceId: service.id, serviceType: service.serviceType })
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
        {serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'} to apply
        the configuration changes
      </p>
    </Banner>
  )
}

export default NeedRedeployFlag

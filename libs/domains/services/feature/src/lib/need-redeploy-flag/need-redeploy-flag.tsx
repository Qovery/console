import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useService } from '../hooks/use-service/use-service'

export function NeedRedeployFlag() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '', databaseId = '' } = useParams()
  const navigate = useNavigate()

  const { data: service } = useService({ environmentId, serviceId: applicationId || databaseId })
  const { data: serviceDeploymentStatus } = useDeploymentStatus({
    environmentId,
    serviceId: service?.id,
  })
  const { mutate: deployService } = useDeployService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
      DEPLOYMENT_LOGS_VERSION_URL(service?.id, serviceDeploymentStatus?.execution_id),
  })

  if (!serviceDeploymentStatus) return null

  const serviceDeploymentStatusState =
    serviceDeploymentStatus?.service_deployment_status ?? ServiceDeploymentStatusEnum.NEVER_DEPLOYED

  if (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.UP_TO_DATE) return null

  const buttonLabel =
    (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  const mutationDeployService = () => {
    if (service) {
      deployService({ serviceId: service.id, serviceType: service.serviceType })
      navigate(
        ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
          DEPLOYMENT_LOGS_VERSION_URL(service.id, serviceDeploymentStatus?.execution_id)
      )
    }
  }

  return (
    <Banner
      color="yellow"
      buttonIconRight="rotate-right"
      buttonLabel={buttonLabel}
      onClickButton={mutationDeployService}
    >
      {serviceDeploymentStatusState === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ? (
        <p>This service is not running</p>
      ) : (
        <p>
          This service needs to be{' '}
          {serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'} to
          apply the configuration changes
        </p>
      )}
    </Banner>
  )
}

export default NeedRedeployFlag

import { twMerge } from 'libs/shared/util-js/src/lib/custom-tw-merge'
import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner, Button, Icon, Tooltip } from '@qovery/shared/ui'
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
    organizationId,
    projectId,
    environmentId,
  })

  if (!serviceDeploymentStatus) return null

  const renderRedeployImmediately = service?.serviceType === 'DATABASE' && service.mode === 'MANAGED'

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
          DEPLOYMENT_LOGS_VERSION_URL(service.id, 'latest')
      )
    }
  }

  return (
    <Banner
      color="yellow"
      // buttonIconRight="rotate-right"
      // buttonLabel={buttonLabel}
      // onClickButton={mutationDeployService}
    >
      <div className="flex items-center gap-4">
        {serviceDeploymentStatusState === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ? (
          <p>This service is not running</p>
        ) : (
          <p>
            This service needs to be{' '}
            {serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'} to
            apply the configuration changes
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="gap-1 !bg-yellow-600/50 !text-yellow-900 hover:!bg-yellow-600/75"
            onClick={mutationDeployService}
          >
            {buttonLabel}
            <Icon iconName="rotate-right" />
          </Button>
          {renderRedeployImmediately && (
            <Tooltip content="Apply changes immediately (do not wait for the next maintenance window)">
              <Button
                type="button"
                className="gap-1 !bg-yellow-600/50 !text-yellow-900 hover:!bg-yellow-600/75"
                onClick={mutationDeployService}
              >
                Deploy and apply now
                <Icon iconName="rotate-right" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Banner>
  )
}

export default NeedRedeployFlag

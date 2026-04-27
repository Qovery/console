import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner, useModal } from '@qovery/shared/ui'
import DatabaseDeployModal from '../database-deploy-modal/database-deploy-modal'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useService } from '../hooks/use-service/use-service'

export function NeedRedeployFlag() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '', databaseId = '' } = useParams()
  const navigate = useNavigate()
  const { openModal } = useModal()

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

  const serviceDeploymentStatusState =
    serviceDeploymentStatus?.service_deployment_status ?? ServiceDeploymentStatusEnum.NEVER_DEPLOYED

  if (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.UP_TO_DATE) return null

  const buttonLabel =
    (serviceDeploymentStatusState === ServiceDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  const mutationDeployService = (applyImmediately = false) => {
    if (service) {
      deployService({ serviceId: service.id, serviceType: service.serviceType, applyImmediately })
      navigate(
        ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
          DEPLOYMENT_LOGS_VERSION_URL(service.id, 'latest')
      )
    }
  }

  const handleDatabaseDeployModal = () => {
    openModal({
      content: (
        <DatabaseDeployModal
          title="Deploy database"
          description="Choose when to deploy and apply your changes"
          actions={[
            {
              id: 'next',
              title: 'Next maintenance window',
              description: (
                <div className="flex flex-col gap-2 text-neutral-350">
                  Redeploy your database and apply changes during the next maintenance window.
                </div>
              ),
              icon: 'calendar-clock',
              callback: () => {
                try {
                  mutationDeployService(false)
                } catch (error) {
                  console.error(error)
                }
              },
            },
            {
              id: 'immediately',
              title: 'Immediately',
              description: (
                <div className="flex flex-col gap-2 text-neutral-350">
                  <div className="flex flex-col gap-1">
                    <span>Redeploy your database and apply changes immediately.</span>
                    <p>
                      <span className="font-bold">Be careful, </span>
                      <span>your database may be unavailable for a few minutes during this process.</span>
                    </p>
                  </div>
                </div>
              ),
              icon: 'timer',
              callback: () => {
                try {
                  mutationDeployService(true)
                } catch (error) {
                  console.error(error)
                }
              },
            },
          ]}
          submitButtonText="Confirm"
        />
      ),
      options: {
        width: 740,
      },
    })
  }

  const handleDeploy = () => {
    if (service?.serviceType === 'DATABASE' && service.mode === 'MANAGED') {
      handleDatabaseDeployModal()
    } else {
      mutationDeployService(false)
    }
  }

  return (
    <Banner color="yellow" buttonIconRight="rotate-right" buttonLabel={buttonLabel} onClickButton={handleDeploy}>
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

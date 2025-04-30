import { EnvironmentDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'

export function NeedRedeployFlag() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: environmentDeploymentStatus } = useDeploymentStatus({ environmentId })
  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
  })

  if (!environmentDeploymentStatus) return null

  const environmentDeploymentStatusState =
    environmentDeploymentStatus?.deployment_status ?? EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED

  if (environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.UP_TO_DATE) return null

  const buttonLabel =
    (environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  const mutationDeployEnvironment = () => {
    deployEnvironment({ environmentId })
    navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL())
  }

  return (
    <Banner
      color="yellow"
      buttonIconRight="rotate-right"
      buttonLabel={buttonLabel}
      onClickButton={mutationDeployEnvironment}
    >
      {environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED ? (
        <p>Environment is not running</p>
      ) : (
        <p>
          Environment needs to be{' '}
          {environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.OUT_OF_DATE ? 'redeployed' : 'deployed'}{' '}
          to apply the configuration changes
        </p>
      )}
    </Banner>
  )
}

export default NeedRedeployFlag

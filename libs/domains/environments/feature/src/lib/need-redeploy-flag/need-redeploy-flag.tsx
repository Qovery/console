import { useParams } from '@tanstack/react-router'
import { EnvironmentDeploymentStatusEnum } from 'qovery-typescript-axios'
import { Banner } from '@qovery/shared/ui'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'

export function NeedRedeployFlag() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })

  const { data: environmentDeploymentStatus } = useDeploymentStatus({ environmentId })
  const { mutate: deployEnvironment } = useDeployEnvironment({
    organizationId,
    projectId,
    environmentId,
  })

  if (!environmentDeploymentStatus) return null

  const environmentDeploymentStatusState =
    environmentDeploymentStatus?.deployment_status ?? EnvironmentDeploymentStatusEnum.NEVER_DEPLOYED

  if (environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.UP_TO_DATE) return null

  const buttonLabel =
    (environmentDeploymentStatusState === EnvironmentDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy' : 'Deploy') + ' now'

  const mutationDeployEnvironment = () => {
    deployEnvironment({ environmentId })
  }

  return (
    <Banner
      className="relative left-1/2 w-screen -translate-x-1/2"
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

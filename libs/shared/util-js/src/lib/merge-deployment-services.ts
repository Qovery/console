import { type DeploymentHistoryEnvironmentV2 } from 'qovery-typescript-axios'
import { type DeploymentService } from '@qovery/shared/interfaces'

export const mergeDeploymentServices = (deploymentHistory?: DeploymentHistoryEnvironmentV2[]): DeploymentService[] => {
  if (!deploymentHistory?.length) {
    return []
  }

  return deploymentHistory.flatMap((deployment) =>
    deployment.stages.flatMap((stage) =>
      (stage.services ?? [])
        .filter((service) => service.identifier.service_type)
        .map((service) => ({
          ...service,
          execution_id: deployment.identifier.execution_id,
          type: service.identifier.service_type as ServiceTypeEnum,
        }))
    )
  )
}

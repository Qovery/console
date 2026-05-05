import { type DeploymentHistoryEnvironmentV2, type DeploymentHistoryService } from 'qovery-typescript-axios'
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface DeploymentService extends DeploymentHistoryService {
  execution_id: string
  type: ServiceTypeEnum
}

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

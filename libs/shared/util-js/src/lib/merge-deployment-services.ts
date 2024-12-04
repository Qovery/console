import {
  type DeploymentHistoryEnvironment,
  type DeploymentHistoryEnvironmentV2,
  JobScheduleEvent,
} from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type DeploymentService, type DeploymentServiceLegacy } from '@qovery/shared/interfaces'

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

/* @deprecated Prefer use `mergeDeploymentServices` */
export const mergeDeploymentServicesLegacy = (deploymentHistory?: DeploymentHistoryEnvironment[]) => {
  const merged: DeploymentServiceLegacy[] = []

  deploymentHistory?.forEach((deployment) => {
    deployment.applications?.forEach((app) => {
      const a: DeploymentServiceLegacy = {
        ...app,
        execution_id: deployment.id,
        type: ServiceTypeEnum.APPLICATION,
      }
      merged.push(a)
    })

    deployment.containers?.forEach((container) => {
      const c: DeploymentServiceLegacy = {
        ...container,
        execution_id: deployment.id,
        type: ServiceTypeEnum.CONTAINER,
      }
      merged.push(c)
    })

    deployment.databases?.forEach((db) => {
      const d: DeploymentServiceLegacy = {
        ...db,
        execution_id: deployment.id,
        type: ServiceTypeEnum.DATABASE,
      }
      merged.push(d)
    })

    deployment.jobs?.forEach((job) => {
      const j: DeploymentServiceLegacy = {
        ...job,
        execution_id: deployment.id,
        type: job.schedule?.event === JobScheduleEvent.CRON ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB,
      }
      merged.push(j)
    })

    deployment.helms?.forEach((helm) => {
      const h: DeploymentServiceLegacy = {
        ...helm,
        execution_id: deployment.id,
        type: ServiceTypeEnum.HELM,
      }
      merged.push(h)
    })
  })

  const dataSorted = merged.sort(
    (
      { execution_id: executionIdA = '', name: nameA = '', updated_at: updatedAtA = '' },
      { execution_id: executionIdB = '', name: nameB = '', updated_at: updatedAtB = '' }
    ) => {
      if (executionIdA !== executionIdB) {
        return updatedAtB.localeCompare(updatedAtA)
      }
      return nameA.localeCompare(nameB)
    }
  )
  return dataSorted
}

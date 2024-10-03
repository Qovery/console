import { type DeploymentHistoryEnvironment, JobScheduleEvent } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type DeploymentService } from '@qovery/shared/interfaces'

export const mergeDeploymentServices = (deploymentHistory?: DeploymentHistoryEnvironment[]) => {
  const merged: DeploymentService[] = []
  deploymentHistory?.forEach((deployment) => {
    deployment.applications?.forEach((app) => {
      const a: DeploymentService = {
        ...app,
        execution_id: deployment.id,
        type: ServiceTypeEnum.APPLICATION,
      }
      merged.push(a)
    })

    deployment.containers?.forEach((container) => {
      const c: DeploymentService = {
        ...container,
        execution_id: deployment.id,
        type: ServiceTypeEnum.CONTAINER,
      }
      merged.push(c)
    })

    deployment.databases?.forEach((db) => {
      const d: DeploymentService = {
        ...db,
        execution_id: deployment.id,
        type: ServiceTypeEnum.DATABASE,
      }
      merged.push(d)
    })

    deployment.jobs?.forEach((job) => {
      const j: DeploymentService = {
        ...job,
        execution_id: deployment.id,
        type: job.schedule?.event === JobScheduleEvent.CRON ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB,
      }
      merged.push(j)
    })

    deployment.helms?.forEach((helm) => {
      const h: DeploymentService = {
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

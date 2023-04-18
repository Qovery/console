import { DeploymentHistoryEnvironment, JobScheduleEvent } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { DeploymentService } from '@qovery/shared/interfaces'

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
  })
  return merged
}

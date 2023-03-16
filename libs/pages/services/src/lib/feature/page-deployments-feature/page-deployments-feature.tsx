import { DeploymentHistoryEnvironment, JobScheduleEvent } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getEnvironmentById, useEnvironmentDeploymentHistory, useFetchEnvironments } from '@qovery/domains/environment'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { DeploymentService } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import PageDeployments from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { projectId = '', environmentId = '' } = useParams()

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)
  const {
    refetch,
    isLoading: loadingStatusDeployments,
    data: environmentDeploymentHistory,
  } = useEnvironmentDeploymentHistory(projectId, environmentId)

  const loadingEnvironment = environmentFactoryMock(1, false, false)

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  const mergeDeploymentServices = (deploymentHistory?: DeploymentHistoryEnvironment[]) => {
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
          type:
            job.schedule?.event === JobScheduleEvent.CRON ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB,
        }
        merged.push(j)
      })
    })
    return merged
  }

  useEffect(() => {
    const fetchEnv = () => refetch()

    !environmentDeploymentHistory && fetchEnv()

    const pullDeployments = setInterval(() => refetch(), 2500)

    return () => clearInterval(pullDeployments)
  }, [environmentDeploymentHistory, refetch, environmentId, projectId, environment])

  return (
    <PageDeployments
      deployments={
        !loadingStatusDeployments
          ? environmentDeploymentHistory &&
            (mergeDeploymentServices(environmentDeploymentHistory) as DeploymentService[])
          : (mergeDeploymentServices(loadingEnvironment[0].deployments) as DeploymentService[])
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={loadingStatusDeployments}
    />
  )
}

export default PageDeploymentsFeature

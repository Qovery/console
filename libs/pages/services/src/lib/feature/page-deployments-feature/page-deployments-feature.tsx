import { JobScheduleEvent } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  environmentsLoadingEnvironmentDeployments,
  fetchEnvironmentDeploymentHistory,
  selectEnvironmentById,
} from '@qovery/domains/environment'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { DeploymentService, EnvironmentEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageDeployments from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { environmentId = '', projectId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const loadingStatusDeployments = useSelector<RootState>((state) => environmentsLoadingEnvironmentDeployments(state))
  const loadingEnvironment = environmentFactoryMock(1, false, false)

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  const mergeDeploymentServices = (env: EnvironmentEntity) => {
    const merged: DeploymentService[] = []
    env.deployments?.forEach((deployment) => {
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

  const isLoading = loadingStatusDeployments !== 'loaded'

  useEffect(() => {
    const fetchEnv = () => {
      dispatch(fetchEnvironmentDeploymentHistory({ environmentId }))
    }

    !environment?.deployments && fetchEnv()

    const pullDeployments = setInterval(
      () => dispatch(fetchEnvironmentDeploymentHistory({ environmentId, silently: true })),
      2500
    )

    return () => clearInterval(pullDeployments)
  }, [dispatch, environmentId, projectId, environment])

  return (
    <PageDeployments
      deployments={
        !isLoading
          ? environment && (mergeDeploymentServices(environment) as DeploymentService[])
          : (mergeDeploymentServices(loadingEnvironment[0]) as DeploymentService[])
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature

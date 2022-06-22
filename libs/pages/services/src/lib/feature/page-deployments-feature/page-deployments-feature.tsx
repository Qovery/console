import {
  environmentFactoryMock,
  environmentsLoadingEnvironmentDeployments,
  fetchEnvironmentDeploymentHistory,
  selectEnvironmentById,
} from '@console/domains/environment'
import { DeploymentService, EnvironmentEntity } from '@console/shared/interfaces'
import { BaseLink } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { ServicesEnum } from '@console/shared/enums'
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
          type: ServicesEnum.APPLICATION,
        }
        merged.push(a)
      })

      deployment.databases?.forEach((db) => {
        const d: DeploymentService = {
          ...db,
          execution_id: deployment.id,
          type: ServicesEnum.DATABASE,
        }
        merged.push(d)
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

    const pullDeployments = setInterval(() => {
      dispatch(fetchEnvironmentDeploymentHistory({ environmentId, silently: true }))
    }, 3000)

    return () => {
      clearInterval(pullDeployments)
    }
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

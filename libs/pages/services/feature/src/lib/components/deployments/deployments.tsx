import {
  environmentFactoryMock,
  environmentsLoadingEnvironmentDeployments,
  fetchEnvironmentDeploymentHistory,
  fetchEnvironments,
  selectEnvironmentById,
  environmentsLoadingStatus,
} from '@console/domains/environment'
import { DeploymentService, EnvironmentEntity } from '@console/shared/interfaces'
import { BaseLink } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import { DeploymentsPage } from '@console/pages/services/ui'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'

export function Deployments() {
  const { environmentId = '', projectId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const loadingStatusEnvironment = useSelector<RootState>((state) => environmentsLoadingStatus(state))
  const loadingStatusDeployments = useSelector<RootState>((state) => environmentsLoadingEnvironmentDeployments(state))
  const loadingEnvironment = environmentFactoryMock(1, false, false)

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
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
          type: 'APPLICATION',
        }
        merged.push(a)
      })

      deployment.databases?.forEach((db) => {
        const d: DeploymentService = {
          ...db,
          execution_id: deployment.id,
          type: 'DATABASE',
        }
        merged.push(d)
      })
    })
    return merged
  }

  const isLoading = loadingStatusEnvironment !== 'loaded' || loadingStatusDeployments !== 'loaded'

  useEffect(() => {
    const fetchEnv = () => {
      dispatch(fetchEnvironments({ projectId }))
      dispatch(fetchEnvironmentDeploymentHistory({ environmentId }))
    }
    !environment?.deployments && fetchEnv()
  }, [dispatch, environmentId, projectId, environment])

  return (
    <DeploymentsPage
      deployments={
        !isLoading
          ? environment && (mergeDeploymentServices(environment) as unknown as DeploymentService[])
          : (mergeDeploymentServices(loadingEnvironment[0]) as unknown as DeploymentService[])
      }
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default Deployments

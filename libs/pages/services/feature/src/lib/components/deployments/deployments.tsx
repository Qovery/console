import {
  environmentFactoryMock,
  environmentsLoadingEnvironmentDeployments,
  fetchEnvironmentDeploymentHistory,
  fetchEnvironments,
  selectEnvironmentById,
  environmentsLoadingStatus,
} from '@console/domains/environment'
import { DeploymentsPage } from '@console/pages/applications/ui'
import { DeploymentService, EnvironmentEntity } from '@console/shared/interfaces'
import { BaseLink } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
import { DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
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
    const deployments = env?.deployments
    deployments?.map((deployment) => {
      const app = deployment.applications?.map((a) => {
        return {
          ...a,
          type: 'APPLICATION',
          execution_id: deployment.id,
        }
      }) as DeploymentService[]
      const db = deployment.databases?.map((d) => {
        return {
          ...d,
          type: 'DATABASE',
          execution_id: deployment.id,
        }
      }) as DeploymentService[]
      const merged: DeploymentService[] = [...app, ...db]
      return merged
    })
  }

  environment && mergeDeploymentServices(environment)

  useEffect(() => {
    const fetchEnv = async () => {
      await dispatch(fetchEnvironments({ projectId }))
      await dispatch(fetchEnvironmentDeploymentHistory({ environmentId }))
    }
    fetchEnv()
  }, [dispatch, environmentId, projectId])

  const isLoading = loadingStatusEnvironment !== 'loaded' || loadingStatusDeployments !== 'loaded'

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

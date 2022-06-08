import {
  environmentFactoryMock,
  environmentsLoadingEnvironmentDeployments,
  fetchEnvironmentDeploymentHistory,
  fetchEnvironments,
  selectEnvironmentById,
  environmentsLoadingStatus,
} from '@console/domains/environment'
import { DeploymentsPage } from '@console/pages/applications/ui'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { BaseLink } from '@console/shared/ui'
import { AppDispatch, RootState } from '@console/store/data'
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
      deployments={!isLoading ? environment?.deployments : loadingEnvironment[0].deployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default Deployments

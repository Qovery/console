import { DatabaseEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  databaseDeploymentsFactoryMock,
  databasesLoadingStatus,
  fetchDatabaseDeployments,
  getDatabasesState,
} from '@console/domains/database'
import { BaseLink } from '@console/shared/ui'
import { useEffect } from 'react'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  const { databaseId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => getDatabasesState(state).entities[databaseId]
  )

  const loadingDatabasesDeployments = databaseDeploymentsFactoryMock(3)

  const loadingStatus = useSelector<RootState>((state) => databasesLoadingStatus(state))
  const loadingStatusDeployments = database?.deployments?.loadingStatus
  const isLoading = loadingStatus !== 'loaded' || loadingStatusDeployments !== 'loaded'

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database',
      linkLabel: 'How to configure my database',
      external: true,
    },
  ]

  useEffect(() => {
    const fetchDatabase = () => {
      dispatch(fetchDatabaseDeployments({ databaseId }))
    }
    !database?.deployments && fetchDatabase()
  }, [dispatch, databaseId, database])

  return (
    <PageDeployments
      databaseId={database?.id}
      deployments={!isLoading ? database?.deployments?.items : loadingDatabasesDeployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature

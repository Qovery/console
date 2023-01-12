import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { databasesLoadingStatus, fetchDatabaseDeployments, getDatabasesState } from '@qovery/domains/database'
import { databaseDeploymentsFactoryMock } from '@qovery/shared/factories'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { PageDeployments } from '../../ui/page-deployments/page-deployments'

export function PageDeploymentsFeature() {
  useDocumentTitle('Database Deployments - Qovery')

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
    if (database && (!database.deployments?.loadingStatus || database.deployments.loadingStatus === 'not loaded')) {
      dispatch(fetchDatabaseDeployments({ databaseId }))
    }

    const pullDeployments = setInterval(() => dispatch(fetchDatabaseDeployments({ databaseId, silently: true })), 2500)

    return () => clearInterval(pullDeployments)
  }, [dispatch, databaseId, database])

  return (
    <PageDeployments
      deployments={!isLoading ? database?.deployments?.items : loadingDatabasesDeployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature

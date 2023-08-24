import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { databasesLoadingStatus, fetchDatabaseDeployments, getDatabasesState } from '@qovery/domains/database'
import { databaseDeploymentsFactoryMock } from '@qovery/shared/factories'
import { type DatabaseEntity } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { type AppDispatch, type RootState } from '@qovery/state/store'
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
    if (loadingStatus === 'loaded') {
      dispatch(fetchDatabaseDeployments({ databaseId }))
    }
  }, [dispatch, loadingStatus, databaseId])

  return (
    <PageDeployments
      deployments={!isLoading ? database?.deployments?.items : loadingDatabasesDeployments}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading}
    />
  )
}

export default PageDeploymentsFeature

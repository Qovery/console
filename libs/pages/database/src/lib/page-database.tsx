import equal from 'fast-deep-equal'
import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import {
  databasesLoadingStatus,
  fetchDatabaseMasterCredentials,
  fetchDatabaseMetrics,
  selectDatabaseById,
} from '@qovery/domains/database'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

export function PageDatabase() {
  const { databaseId = '', environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => selectDatabaseById(state, databaseId),
    equal
  )

  useDocumentTitle(`${database?.name || 'Database'} - Qovery`)

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => databasesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (database && databaseId && loadingStatus === 'loaded') {
      database?.metrics?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMetrics({ databaseId }))
      database?.credentials?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMasterCredentials({ databaseId }))
    }
  }, [database && databaseId, loadingStatus])

  return (
    <Container database={database} environment={environment}>
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageDatabase

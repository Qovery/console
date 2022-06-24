import { useDocumentTitle } from '@console/shared/utils'
import { Route, Routes, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { Environment } from 'qovery-typescript-axios'
import { selectEnvironmentById } from '@console/domains/environment'
import { DatabaseEntity, LoadingStatus } from '@console/shared/interfaces'
import {
  databasesLoadingStatus,
  fetchDatabase,
  fetchDatabaseMasterCredentials,
  fetchDatabaseMetrics,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
  selectDatabaseById,
} from '@console/domains/database'
import { useEffect } from 'react'
import { StatusMenuActions } from '@console/shared/ui'
import Container from './ui/container/container'
import { ROUTER_DATABASE } from './router/router'

export function PageDatabase() {
  useDocumentTitle('Database - Qovery')
  const { databaseId = '', environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => databasesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  const statusActions: StatusMenuActions[] = [
    {
      name: 'restart',
      action: (databaseId: string) => dispatch(postDatabaseActionsRestart({ environmentId, databaseId })),
    },
    {
      name: 'deploy',
      action: (databaseId: string) => dispatch(postDatabaseActionsDeploy({ environmentId, databaseId })),
    },
    {
      name: 'stop',
      action: (databaseId: string) => dispatch(postDatabaseActionsStop({ environmentId, databaseId })),
    },
  ]

  useEffect(() => {
    if (databaseId && loadingStatus === 'loaded') {
      database?.metrics?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMetrics({ databaseId }))
      database?.credentials?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMasterCredentials({ databaseId }))
    } else {
      dispatch(fetchDatabase({ databaseId }))
    }
  }, [databaseId, loadingStatus])

  return (
    <Container database={database} environment={environment} statusActions={statusActions}>
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageDatabase

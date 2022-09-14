import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'
import {
  databasesLoadingStatus,
  deleteDatabaseAction,
  fetchDatabase,
  fetchDatabaseMasterCredentials,
  fetchDatabaseMetrics,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
  selectDatabaseById,
} from '@qovery/domains/database'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/router'
import { StatusMenuActions } from '@qovery/shared/ui'
import { isDeleteAvailable, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

export function PageDatabase() {
  useDocumentTitle('Database - Qovery')
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', databaseId = '', environmentId = '' } = useParams()
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

  const removeDatabase = (databaseId: string) => {
    dispatch(deleteDatabaseAction({ environmentId, databaseId }))
    navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
  }

  useEffect(() => {
    if (databaseId && loadingStatus === 'loaded') {
      database?.metrics?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMetrics({ databaseId }))
      database?.credentials?.loadingStatus !== 'loaded' && dispatch(fetchDatabaseMasterCredentials({ databaseId }))
    } else {
      dispatch(fetchDatabase({ databaseId }))
    }
  }, [databaseId, loadingStatus])

  return (
    <Container
      database={database}
      environment={environment}
      statusActions={statusActions}
      removeDatabase={database?.status && isDeleteAvailable(database.status.state) ? removeDatabase : undefined}
    >
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageDatabase

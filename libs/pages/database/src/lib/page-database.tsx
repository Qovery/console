import equal from 'fast-deep-equal'
import { DatabaseModeEnum, StateEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import {
  databasesLoadingStatus,
  fetchDatabaseMasterCredentials,
  fetchDatabaseMetrics,
  selectDatabaseById,
} from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/state/store'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

export function PageDatabase() {
  const { databaseId = '', environmentId = '', projectId = '' } = useParams()
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => selectDatabaseById(state, databaseId),
    equal
  )

  useDocumentTitle(`${database?.name || 'Database'} - Qovery`)

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => databasesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: database?.environment?.id,
    serviceId: database?.id,
  })
  const isDeployed = deploymentStatus?.state === StateEnum.DEPLOYED

  useEffect(() => {
    if (isDeployed && database?.mode !== DatabaseModeEnum.MANAGED && databaseId && loadingStatus === 'loaded') {
      database?.metrics?.loadingStatus !== 'loaded' &&
        database?.metrics?.loadingStatus !== 'error' &&
        dispatch(fetchDatabaseMetrics({ databaseId }))
    }

    if (database && databaseId && loadingStatus === 'loaded' && database?.credentials?.loadingStatus !== 'loaded') {
      dispatch(fetchDatabaseMasterCredentials({ databaseId }))
    }
  }, [databaseId, loadingStatus, environmentId, database, isDeployed, dispatch])

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

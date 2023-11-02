import equal from 'fast-deep-equal'
import { useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import { selectDatabaseById } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { type DatabaseEntity } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type RootState } from '@qovery/state/store'
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

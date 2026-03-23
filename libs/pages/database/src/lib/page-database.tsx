import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService, useServiceType } from '@qovery/domains/services/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { DATABASE_GENERAL_URL, DATABASE_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

function PageDatabaseWrapped() {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const { data: environment, error: environmentError } = useEnvironment({ environmentId })
  const { data: serviceType, isSuccess: isSuccessServiceType } = useServiceType({
    environmentId,
    serviceId: databaseId,
  })
  const { data: service } = useService({ environmentId, serviceId: databaseId })

  useDocumentTitle(`${service?.name || 'Database'} - Qovery`)

  // serviceType can be `undefined` if the `find` method in `select` return nothing. However the query itself is still success.
  // Don't seems to have a better way for this case in react-query for now
  // https://github.com/TanStack/query/issues/1540
  // https://github.com/TanStack/query/issues/5878
  if (environmentError || (!serviceType && isSuccessServiceType)) {
    return <NotFoundPage error={environmentError} />
  }

  return (
    <Container service={service as AnyService} environment={environment}>
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={
            <Navigate
              replace
              to={DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL}
            />
          }
        />
      </Routes>
    </Container>
  )
}

export function PageDatabase() {
  return <PageDatabaseWrapped />
}

export default PageDatabase

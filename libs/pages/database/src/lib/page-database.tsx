import { Route, Routes, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

export function PageDatabase() {
  const { databaseId = '', environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: databaseId })

  useDocumentTitle(`${service?.name || 'Database'} - Qovery`)

  return (
    <Container service={service as AnyService} environment={environment}>
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageDatabase

import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

export function PageApplication() {
  const { applicationId = '', environmentId = '', organizationId = '', projectId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  useDocumentTitle(`${service?.name || 'Application'} - Qovery`)

  return (
    <Container service={service as AnyService} environment={environment}>
      <Routes>
        {ROUTER_APPLICATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={
            <Navigate
              replace
              to={APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL}
            />
          }
        />
      </Routes>
    </Container>
  )
}

export default PageApplication

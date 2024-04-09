import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { APPLICATION_GENERAL_URL, SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_SERVICES } from './router/router'
import Container from './ui/container/container'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: environment } = useEnvironment({ environmentId })

  useEffect(() => {
    if (location.pathname === SERVICES_URL(organizationId, projectId, environmentId)) {
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${APPLICATION_GENERAL_URL}`)
    }
  }, [location, navigate, projectId, organizationId, environmentId])

  return (
    <Container environment={environment}>
      <Routes>
        {ROUTER_SERVICES.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={
            <Navigate replace to={SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL} />
          }
        />
      </Routes>
    </Container>
  )
}

export default PageServices

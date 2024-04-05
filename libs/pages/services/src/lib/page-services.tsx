import { useContext, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  APPLICATION_GENERAL_URL,
  AUDIT_LOGS_PARAMS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { SpotlightContext } from '@qovery/shared/spotlight/feature'
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

  const { setQuickActions } = useContext(SpotlightContext)
  useEffect(() => {
    if (!environmentId) {
      return
    }

    setQuickActions([
      {
        label: 'See logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId),
      },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          projectId,
          targetId: environmentId,
          targetType: 'ENVIRONMENT',
        }),
      },
    ])
  }, [environmentId, projectId, organizationId])

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

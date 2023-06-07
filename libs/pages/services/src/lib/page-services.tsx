import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  getEnvironmentById,
  getEnvironmentStatusById,
  useEnvironmentRunningStatus,
  useFetchEnvironments,
  useFetchEnvironmentsStatus,
} from '@qovery/domains/environment'
import { APPLICATION_GENERAL_URL, SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import { ROUTER_SERVICES } from './router/router'
import Container from './ui/container/container'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)
  const environmentsStatus = useFetchEnvironmentsStatus(projectId)
  const environmentRunningStatus = useEnvironmentRunningStatus(environmentId)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (location.pathname === SERVICES_URL(organizationId, projectId, environmentId)) {
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${APPLICATION_GENERAL_URL}`)
    }
  }, [location, navigate, environmentsStatus, projectId, organizationId, environmentId, dispatch])

  return (
    <Container
      environment={environment}
      environmentStatus={getEnvironmentStatusById(environmentId, environmentsStatus.data)}
      environmentRunningStatus={environmentRunningStatus}
    >
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

import equal from 'fast-deep-equal'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchEnvironmentsStatus, selectEnvironmentById } from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { APPLICATION_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { ROUTER_SERVICES } from './router/router'
import Container from './ui/container/container'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const environment = useSelector<RootState, EnvironmentEntity | undefined>(
    (state) => selectEnvironmentById(state, environmentId),
    equal
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (location.pathname === SERVICES_URL(organizationId, projectId, environmentId)) {
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${APPLICATION_GENERAL_URL}`)
    }
    const fetchEnvironmentsStatusByInterval = setInterval(() => dispatch(fetchEnvironmentsStatus({ projectId })), 3000)
    return () => clearInterval(fetchEnvironmentsStatusByInterval)
  }, [location, navigate, organizationId, projectId, environmentId, dispatch])

  return (
    <Container environment={environment}>
      <Routes>
        {ROUTER_SERVICES.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageServices

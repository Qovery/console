import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { Environment } from 'qovery-typescript-axios'
import { APPLICATION_GENERAL_URL, SERVICES_DEPLOYMENTS_URL, SERVICES_URL } from '@console/shared/router'
import { useDocumentTitle } from '@console/shared/utils'
import {
  deleteEnvironmentActionsCancelDeployment,
  fetchEnvironmentsStatus,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
  selectEnvironmentById,
} from '@console/domains/environment'
import { AppDispatch, RootState } from '@console/store/data'
import { ROUTER_SERVICES } from './router/router'
import { useEffect } from 'react'
import Container from './ui/container/container'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (location.pathname === SERVICES_URL(organizationId, projectId, environmentId)) {
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${APPLICATION_GENERAL_URL}`)
    }
    const fetchEnvironmentsStatusByInterval = setInterval(() => dispatch(fetchEnvironmentsStatus({ projectId })), 3000)
    return () => clearInterval(fetchEnvironmentsStatusByInterval)
  }, [location, navigate, organizationId, projectId, environmentId, dispatch])

  const statusActions = [
    {
      name: 'redeploy',
      action: () =>
        dispatch(
          postEnvironmentActionsRestart({
            projectId,
            environmentId,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'deploy',
      action: () =>
        dispatch(
          postEnvironmentActionsDeploy({
            projectId,
            environmentId,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'stop',
      action: () =>
        dispatch(
          postEnvironmentActionsStop({
            projectId,
            environmentId,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'cancel-deployment',
      action: () =>
        dispatch(
          postEnvironmentActionsCancelDeployment({
            projectId,
            environmentId,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'delete',
      action: () =>
        dispatch(
          deleteEnvironmentActionsCancelDeployment({
            projectId,
            environmentId,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    },
  ]

  return (
    <Container environment={environment} statusActions={statusActions}>
      <Routes>
        {ROUTER_SERVICES.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageServices

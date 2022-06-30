import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { APPLICATION_GENERAL_URL, SERVICES_DEPLOYMENTS_URL, SERVICES_URL } from '@console/shared/router'
import { isDeleteAvailable, useDocumentTitle } from '@console/shared/utils'
import {
  deleteEnvironmentActions,
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
import { EnvironmentEntity } from '@console/shared/interfaces'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
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
  ]

  const removeEnvironment = () => {
    dispatch(
      deleteEnvironmentActions({
        projectId,
        environmentId,
      })
    )
  }

  return (
    <Container
      environment={environment}
      statusActions={statusActions}
      removeEnvironment={
        environment?.status && isDeleteAvailable(environment?.status?.state) ? removeEnvironment : undefined
      }
    >
      <Routes>
        {ROUTER_SERVICES.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageServices

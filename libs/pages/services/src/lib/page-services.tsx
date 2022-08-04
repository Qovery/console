import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  APPLICATION_GENERAL_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_URL,
} from '@console/shared/router'
import { isDeleteAvailable, useDocumentTitle } from '@console/shared/utils'
import {
  deleteEnvironmentAction,
  fetchEnvironments,
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
import { useModalConfirmation } from '@console/shared/ui'

export function PageServices() {
  useDocumentTitle('Services - Qovery')
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { openModalConfirmation } = useModalConfirmation()

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

  const removeEnvironment = async () => {
    openModalConfirmation({
      title: 'Delete environment',
      description: 'To confirm the deletion of your environment, please type the name of the environment:',
      name: environment?.name,
      isDelete: true,
      action: async () => {
        await dispatch(
          deleteEnvironmentAction({
            projectId,
            environmentId,
          })
        )
        await dispatch(fetchEnvironments({ projectId: projectId }))
        await navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL)
      },
    })
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

import { useDocumentTitle } from '@console/shared/utils'
import { Route, Routes, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { Environment } from 'qovery-typescript-axios'
import { selectEnvironmentById } from '@console/domains/environment'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import {
  applicationsLoadingStatus,
  deleteApplicationActionsStop,
  fetchApplicationCommits,
  fetchApplicationInstances,
  fetchApplicationLinks,
  fetchApplicationStatus,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
  selectApplicationById,
} from '@console/domains/application'
import { useEffect } from 'react'
import { StatusMenuActions } from '@console/shared/ui'
import Container from './ui/container/container'
import { ROUTER_APPLICATION } from './router/router'
import { useLocation } from 'react-router-dom'
import { APPLICATION_DEPLOYMENTS_URL, APPLICATION_URL } from '@console/shared/router'

export function PageApplication() {
  useDocumentTitle('Application - Qovery')
  const { applicationId = '', environmentId = '', organizationId, projectId } = useParams()
  const { pathname } = useLocation()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (applicationId && loadingStatus === 'loaded') {
      application?.links?.loadingStatus !== 'loaded' && dispatch(fetchApplicationLinks({ applicationId }))
      application?.instances?.loadingStatus !== 'loaded' && dispatch(fetchApplicationInstances({ applicationId }))
      application?.commits?.loadingStatus !== 'loaded' && dispatch(fetchApplicationCommits({ applicationId }))
    }
    const fetchApplicationStatusByInterval = setInterval(
      () => dispatch(fetchApplicationStatus({ applicationId })),
      3000
    )
    return () => clearInterval(fetchApplicationStatusByInterval)
  }, [applicationId, loadingStatus, dispatch])

  const statusActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsRestart({
            environmentId,
            applicationId,
            withDeployments:
              pathname ===
              APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'deploy',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsDeploy({
            environmentId,
            applicationId,
            withDeployments:
              pathname ===
              APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'stop',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsStop({
            environmentId,
            applicationId,
            withDeployments:
              pathname ===
              APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
          })
        ),
    },
    {
      name: 'delete',
      action: (applicationId: string) =>
        dispatch(
          deleteApplicationActionsStop({
            environmentId,
            applicationId,
            withDeployments:
              pathname ===
              APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
          })
        ),
    },
  ]

  return (
    <Container application={application} environment={environment} statusActions={statusActions}>
      <Routes>
        {ROUTER_APPLICATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageApplication

import equal from 'fast-deep-equal'
import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router'
import { useLocation } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  deleteApplicationAction,
  fetchApplicationCommits,
  fetchApplicationInstances,
  fetchApplicationLinks,
  fetchApplicationStatus,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
  selectApplicationById,
} from '@console/domains/application'
import { selectEnvironmentById } from '@console/domains/environment'
import { ApplicationEntity, GitApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { APPLICATION_DEPLOYMENTS_URL, APPLICATION_URL } from '@console/shared/router'
import { StatusMenuActions } from '@console/shared/ui'
import { isDeleteAvailable, useDocumentTitle } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

export function PageApplication() {
  useDocumentTitle('Application - Qovery')
  const { applicationId = '', environmentId = '', organizationId, projectId } = useParams()
  const { pathname } = useLocation()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    equal
  )

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (applicationId && loadingStatus === 'loaded') {
      if (application?.links?.loadingStatus !== 'loaded') dispatch(fetchApplicationLinks({ applicationId }))
      if (application?.instances?.loadingStatus !== 'loaded') dispatch(fetchApplicationInstances({ applicationId }))
      if ((application as GitApplicationEntity)?.commits?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationCommits({ applicationId }))
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
  ]

  const removeApplication = (applicationId: string) => {
    dispatch(
      deleteApplicationAction({
        environmentId,
        applicationId,
      })
    )
  }

  return (
    <Container
      application={application}
      environment={environment}
      statusActions={statusActions}
      removeApplication={
        application?.status && isDeleteAvailable(application.status.state) ? removeApplication : undefined
      }
    >
      <Routes>
        {ROUTER_APPLICATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageApplication

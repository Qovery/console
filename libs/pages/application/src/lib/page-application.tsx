import equal from 'fast-deep-equal'
import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router'
import { useLocation } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  deleteApplicationAction,
  deleteContainerAction,
  fetchApplicationCommits,
  fetchApplicationInstances,
  fetchApplicationLinks,
  fetchApplicationStatus,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
  postContainerActionsDeploy,
  postContainerActionsRestart,
  postContainerActionsStop,
  selectApplicationById,
} from '@console/domains/application'
import { selectEnvironmentById } from '@console/domains/environment'
import { ServicesEnum, getServiceType } from '@console/shared/enums'
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
      if (application?.links?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationLinks({ applicationId, serviceType: getServiceType(application) }))
      if (application?.instances?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationInstances({ applicationId, serviceType: getServiceType(application) }))
      if (
        (application as GitApplicationEntity)?.commits?.loadingStatus !== 'loaded' &&
        getServiceType(application) === ServicesEnum.APPLICATION
      )
        dispatch(fetchApplicationCommits({ applicationId }))
    }
    const fetchApplicationStatusByInterval = setInterval(
      () => dispatch(fetchApplicationStatus({ applicationId, serviceType: getServiceType(application) })),
      3000
    )
    return () => clearInterval(fetchApplicationStatusByInterval)
  }, [applicationId, loadingStatus, dispatch])

  const payload = (applicationId: string) => ({
    environmentId,
    applicationId,
    withDeployments:
      pathname ===
      APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
  })

  const statusActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) => {
        if (application as GitApplicationEntity) {
          dispatch(postApplicationActionsRestart(payload(applicationId)))
        } else {
          dispatch(postContainerActionsRestart(payload(applicationId)))
        }
      },
    },
    {
      name: 'deploy',
      action: (applicationId: string) => {
        if (application as GitApplicationEntity) {
          dispatch(postApplicationActionsDeploy(payload(applicationId)))
        } else {
          dispatch(postContainerActionsDeploy(payload(applicationId)))
        }
      },
    },
    {
      name: 'stop',
      action: (applicationId: string) => {
        if (application as GitApplicationEntity) {
          dispatch(postApplicationActionsStop(payload(applicationId)))
        } else {
          dispatch(postContainerActionsStop(payload(applicationId)))
        }
      },
    },
  ]

  const removeApplication = (applicationId: string) => {
    if (getServiceType(application) === ServicesEnum.APPLICATION) {
      dispatch(
        deleteApplicationAction({
          environmentId,
          applicationId,
        })
      )
    } else {
      dispatch(
        deleteContainerAction({
          environmentId,
          applicationId,
        })
      )
    }
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

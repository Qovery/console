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
} from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, GitApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { APPLICATION_DEPLOYMENTS_URL, APPLICATION_URL } from '@qovery/shared/router'
import { StatusMenuActions } from '@qovery/shared/ui'
import { isDeleteAvailable, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

export function PageApplication() {
  const { applicationId = '', environmentId = '', organizationId, projectId } = useParams()
  const { pathname } = useLocation()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    equal
  )

  useDocumentTitle(`${application?.name || 'Application'} - Qovery`)

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
        getServiceType(application) === ServiceTypeEnum.APPLICATION
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
    serviceType: getServiceType(application),
    withDeployments:
      pathname ===
      APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
  })

  const statusActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) => dispatch(postApplicationActionsRestart(payload(applicationId))),
    },
    {
      name: 'deploy',
      action: (applicationId: string) => dispatch(postApplicationActionsDeploy(payload(applicationId))),
    },
    {
      name: 'stop',
      action: (applicationId: string) => dispatch(postApplicationActionsStop(payload(applicationId))),
    },
  ]

  const removeApplication = (applicationId: string) => {
    dispatch(
      deleteApplicationAction({
        environmentId,
        applicationId,
        serviceType: getServiceType(application),
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

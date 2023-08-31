import equal from 'fast-deep-equal'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  fetchApplicationCommits,
  fetchApplicationInstances,
  fetchApplicationLinks,
  selectApplicationById,
} from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { getServiceType, isApplication, isGitJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

export function PageApplication() {
  const { applicationId = '', environmentId = '', organizationId = '', projectId = '' } = useParams()
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    equal
  )

  useDocumentTitle(`${application?.name || 'Application'} - Qovery`)

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (application && applicationId && loadingStatus === 'loaded') {
      if (application.links?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationLinks({ applicationId, serviceType: getServiceType(application) }))
      if (application.instances?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationInstances({ applicationId, serviceType: getServiceType(application) }))
      if (application?.commits?.loadingStatus !== 'loaded' && (isApplication(application) || isGitJob(application)))
        dispatch(fetchApplicationCommits({ applicationId, serviceType: getServiceType(application) }))
    }
  }, [applicationId, loadingStatus, dispatch])

  return (
    <Container application={application} environment={environment}>
      <Routes>
        {ROUTER_APPLICATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={
            <Navigate
              replace
              to={APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL}
            />
          }
        />
      </Routes>
    </Container>
  )
}

export default PageApplication

import equal from 'fast-deep-equal'
import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import {
  applicationsLoadingStatus,
  fetchApplicationCommits,
  fetchApplicationInstances,
  fetchApplicationLinks,
  fetchApplicationStatus,
  selectApplicationById,
} from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { getServiceType, isApplication, isGitJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

export function PageApplication() {
  const { applicationId = '', environmentId = '' } = useParams()
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
    if (application && applicationId && loadingStatus === 'loaded') {
      if (application.links?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationLinks({ applicationId, serviceType: getServiceType(application) }))
      if (application.instances?.loadingStatus !== 'loaded')
        dispatch(fetchApplicationInstances({ applicationId, serviceType: getServiceType(application) }))
      if (application?.commits?.loadingStatus !== 'loaded' && (isApplication(application) || isGitJob(application)))
        dispatch(fetchApplicationCommits({ applicationId, serviceType: getServiceType(application) }))
    }
    const fetchApplicationStatusByInterval = setInterval(
      () =>
        application && dispatch(fetchApplicationStatus({ applicationId, serviceType: getServiceType(application) })),
      3000
    )
    return () => clearInterval(fetchApplicationStatusByInterval)
  }, [applicationId, loadingStatus, dispatch])

  return (
    <Container application={application} environment={environment}>
      <Routes>
        {ROUTER_APPLICATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageApplication

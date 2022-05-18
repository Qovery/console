import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import {
  applicationsLoadingStatus,
  fetchApplicationInstances,
  fetchApplicationLinks,
  selectApplicationById,
} from '@console/domains/application'
import { Route, Routes, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { selectEnvironmentById } from '@console/domains/environment'
import { LoadingStatus, RootState } from '@console/shared/interfaces'
import { Application, Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { ROUTER_APPLICATION } from './router/router'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { applicationId = '', environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, Application | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => applicationsLoadingStatus(state))

  const dispatch = useDispatch()

  useEffect(() => {
    applicationId &&
      loadingStatus === 'loaded' &&
      dispatch(fetchApplicationLinks({ applicationId })) &&
      dispatch(fetchApplicationInstances({ applicationId }))
  }, [applicationId, loadingStatus])

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

export default ApplicationPage

import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'
import { Route, Routes, useParams } from 'react-router'
import { selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import { useSelector } from 'react-redux'
import { selectEnvironmentById } from '@console/domains/environment'
import { Application, Environment } from 'qovery-typescript-axios'
import { ROUTER_APPLICATIONS } from './router/router'
import { RootState } from '@console/store/data'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  return (
    <Container applications={applicationsByEnv} environment={environment}>
      <Routes>
        {ROUTER_APPLICATIONS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default ApplicationsPage

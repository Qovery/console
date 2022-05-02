import { Container } from '@console/pages/environments/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { useEnviroments } from '@console/domains/projects'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { Route, Routes } from 'react-router-dom'
import { ROUTER_ENVIRONMENTS } from './router/router'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')
  const { environments, getEnvironmentsStatus } = useEnviroments()
  const { projectId } = useParams()

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, getEnvironmentsStatus])

  return (
    <Container environments={environments}>
      <Routes>
        {ROUTER_ENVIRONMENTS.map((route, index) => (
          <Route key={index} path={route.path.toString()} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default EnvironmentsPage

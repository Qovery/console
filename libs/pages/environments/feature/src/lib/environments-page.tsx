import { Container } from '@console/pages/environments/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { useEnviroments } from '@console/domains/projects'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { Route, Routes } from 'react-router'
import { ROUTER_ENVIRONMENTS } from './router/router'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')
  const { getEnvironmentsStatus } = useEnviroments()
  const { projectId } = useParams()

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, getEnvironmentsStatus])

  return (
    <Container>
      <Routes>
        {ROUTER_ENVIRONMENTS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default EnvironmentsPage

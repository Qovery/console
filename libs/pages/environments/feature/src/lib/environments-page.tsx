import { Container } from '@console/pages/environments/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { Route, Routes } from 'react-router'
import { ROUTER_ENVIRONMENTS } from './router/router'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')

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

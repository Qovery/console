import { Routes, Route } from 'react-router'
import { ROUTER_ENVIRONMENTS } from './router/router'
import Container from './ui/container/container'

export function PageEnvironments() {
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

export default PageEnvironments

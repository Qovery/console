import { Route, Routes } from 'react-router'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING } from './router/router'

export function OnboardingPage() {
  return (
    <Container>
      <Routes>
        {ROUTER_ONBOARDING.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default OnboardingPage

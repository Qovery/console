import { Route, Routes } from 'react-router'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'

export function OnboardingPage() {
  return (
    <>
      <Container>
        <Routes>
          {ROUTER_ONBOARDING_STEP_1.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
        </Routes>
      </Container>
      <Container>
        <Routes>
          {ROUTER_ONBOARDING_STEP_2.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
        </Routes>
      </Container>
    </>
  )
}

export default OnboardingPage

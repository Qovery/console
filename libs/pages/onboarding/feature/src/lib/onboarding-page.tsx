import { Route, Routes } from 'react-router'
import { LayoutOnboarding } from '@console/pages/onboarding/ui'
import { ROUTER_ONBOARDING } from './router/router'

export function OnboardingPage() {
  return (
    <LayoutOnboarding routes={ROUTER_ONBOARDING}>
      <Routes>
        {ROUTER_ONBOARDING.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </LayoutOnboarding>
  )
}

export default OnboardingPage

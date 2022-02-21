import { Route, Routes } from 'react-router'
import { LayoutOnboarding, ROUTER_ONBOARDING } from '@console/pages/onboarding/ui'

export function OnboardingPage() {
  return (
    <LayoutOnboarding>
      <Routes>
        {ROUTER_ONBOARDING.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </LayoutOnboarding>
  )
}

export default OnboardingPage

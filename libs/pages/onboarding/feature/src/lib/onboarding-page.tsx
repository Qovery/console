import { Route, Routes } from 'react-router'
import { ROUTER_ONBOARDING } from '@console/pages/onboarding/ui'

export function OnboardingPage() {
  return (
    <Routes>
      {ROUTER_ONBOARDING.map((route) => (
        <Route key={route.path} path={route.path} element={route.component} />
      ))}
    </Routes>
  )
}

export default OnboardingPage

import { Route, Routes } from 'react-router'
import { Layout, ROUTER_ONBOARDING } from '@console/pages/onboarding/ui'

export function OnboardingPage() {
  return (
    <Layout>
      <Routes>
        {ROUTER_ONBOARDING.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Layout>
  )
}

export default OnboardingPage

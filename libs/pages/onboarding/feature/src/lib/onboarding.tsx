import { useEffect } from 'react'
import { Route, Routes, useParams } from 'react-router'
import { useUser } from '@console/domains/user'
import { useOrganization } from '@console/domains/organization'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'

export function OnboardingPage() {
  const { getOrganization } = useOrganization()
  const { getUserSignUp } = useUser()
  const params = useParams()

  useEffect(() => {
    async function fetchData() {
      await getUserSignUp()
    }
    fetchData()
  }, [getUserSignUp, getOrganization])

  const firstStep = !!ROUTER_ONBOARDING_STEP_1.find((currentRoute) => currentRoute.path === `/${params['*']}`)

  return (
    <Container firstStep={firstStep} params={params}>
      <Routes>
        {ROUTER_ONBOARDING_STEP_1.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        {ROUTER_ONBOARDING_STEP_2.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default OnboardingPage

import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router'
import { useUser } from '@console/domains/user'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@console/shared/utils'

export function OnboardingPage() {
  const { userSignUp, getUserSignUp } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    getUserSignUp()
  }, [getUserSignUp])

  useEffect(() => {
    if (userSignUp.dx_auth) navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  }, [userSignUp, navigate])

  return (
    <Container>
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

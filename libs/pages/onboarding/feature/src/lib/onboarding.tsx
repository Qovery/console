import { useEffect } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import { useUser } from '@console/domains/user'
import { useOrganization } from '@console/domains/organization'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@console/shared/utils'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { getOrganization } = useOrganization()
  const { userSignUp, getUserSignUp } = useUser()
  const params = useParams()

  const firstStep = !!ROUTER_ONBOARDING_STEP_1.find((currentRoute) => currentRoute.path === `/${params['*']}`)

  useEffect(() => {
    async function fetchData() {
      await getUserSignUp()
    }
    fetchData()
  }, [getUserSignUp, getOrganization])

  useEffect(() => {
    if (!firstStep && !userSignUp.dx_auth && userSignUp.loadingStatus === 'loaded') {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
    }
  }, [firstStep, userSignUp, navigate])

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

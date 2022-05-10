import { useEffect } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import { useUser } from '@console/domains/user'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@console/shared/utils'
import { LoadingScreen } from '@console/shared/ui'
import { Container } from './components/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { userSignUp, getUserSignUp, loadingStatus } = useUser()
  const params = useParams()

  const firstStep = !!ROUTER_ONBOARDING_STEP_1.find((currentRoute) => currentRoute.path === `/${params['*']}`)

  useEffect(() => {
    async function fetchData() {
      await getUserSignUp()
    }
    fetchData()
  }, [getUserSignUp])

  useEffect(() => {
    if (loadingStatus === 'loaded') {
      if (!firstStep && !userSignUp?.dx_auth) {
        navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
      }
      if (firstStep && userSignUp?.dx_auth) {
        navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
      }
      if (params['*'] === '') {
        navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
      }
    }
  }, [userSignUp, firstStep, navigate, params])

  if (params['*'] === '') {
    return <LoadingScreen />
  }

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

import { useEffect } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { Container } from './feature/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'

export function PageOnboarding() {
  const navigate = useNavigate()
  const params = useParams()
  const { refetch: refetchUserSignUp } = useUserSignUp({ enabled: false })

  const firstStep = !!ROUTER_ONBOARDING_STEP_1.find((currentRoute) => currentRoute.path === `/${params['*']}`)

  useEffect(() => {
    async function fetchData() {
      if (params['*'] === '') {
        const { data: userSignUp } = await refetchUserSignUp()
        // check if user request work before redirect
        if (userSignUp) {
          navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
        }
      }
    }
    fetchData()
  }, [refetchUserSignUp, navigate, params])

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

export default PageOnboarding

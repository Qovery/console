import { SignUp } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { fetchUserSignUp } from '@qovery/domains/user'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
import { Container } from './feature/container/container'
import { ROUTER_ONBOARDING_STEP_1, ROUTER_ONBOARDING_STEP_2 } from './router/router'

export function PageOnboarding() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const params = useParams()

  const firstStep = !!ROUTER_ONBOARDING_STEP_1.find((currentRoute) => currentRoute.path === `/${params['*']}`)

  useEffect(() => {
    async function fetchData() {
      if (params['*'] === '') {
        const user: SignUp = await dispatch(fetchUserSignUp()).unwrap()
        // check if user request work before redirect
        if (user) {
          navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
        }
      }
    }
    fetchData()
  }, [dispatch, navigate, params])

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

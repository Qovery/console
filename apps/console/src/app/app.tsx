import { useCallback, useEffect } from 'react'
import LogRocket from 'logrocket'
import axios from 'axios'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  BetaRoute,
  LOGIN_URL,
  NO_BETA_ACCESS_URL,
  NoBetaAccess,
  ONBOARDING_URL,
  ProtectedRoute,
} from '@console/shared/router'
import { useAuth } from '@console/shared/auth'
import { useAuthInterceptor, useDocumentTitle } from '@console/shared/utils'
import { LoadingScreen } from '@console/shared/ui'
import { PageOnboarding } from '@console/pages/onboarding'
import { PageLogin } from '@console/pages/login'
import { environment } from '../environments/environment'
import { Layout } from '@console/pages/layout'
import { useSelector } from 'react-redux'
import { selectUser } from '@console/domains/user'
import posthog from 'posthog-js'
import { ROUTER } from './router/main.router'
import { useIntercom } from 'react-use-intercom'
import { UserInterface } from '@console/shared/interfaces'

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading } = useAuth()

  const gtmParams = { id: environment.gtm }

  const user = useSelector(selectUser)
  const { update: updateIntercom } = useIntercom()

  const initMonitorings = useCallback(
    (user: UserInterface) => {
      if (!user || !user.sub) return

      posthog.init(environment.posthog, {
        api_host: environment.posthog_apihost,
        loaded: () => {
          posthog.identify(user.sub, {
            ...user,
          })
        },
      })

      LogRocket.identify(user.sub, {
        ...user,
      })

      updateIntercom({
        email: user.email,
        name: user.name,
        userId: user.sub,
      })
    },
    [updateIntercom]
  )

  // init axios interceptor
  useAuthInterceptor(axios, environment.api)

  useEffect(() => {
    // if (process.env['NODE_ENV'] === 'production') {

    // if onboarding feature flag activated we add onboarding routes to router
    // const isOnboarding = posthog && posthog.isFeatureEnabled('v3-onboarding')
    const isOnboarding = environment.onboarding === 'true'
    if (isOnboarding) {
      ROUTER.push({
        path: `${ONBOARDING_URL}/*`,
        component: <PageOnboarding />,
        protected: true,
      })
    }

    // init logrocket
    LogRocket.init(environment.logrocket)
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      if (process.env['NODE_ENV'] !== 'production') {
        posthog.feature_flags.override(['v3-beta'])
      } else {
        initMonitorings(user)
      }
    }
  }, [user, initMonitorings])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <GTMProvider state={gtmParams}>
      <Routes>
        <Route path={LOGIN_URL} element={<PageLogin />} />
        <Route
          path={NO_BETA_ACCESS_URL}
          element={
            <ProtectedRoute>
              <NoBetaAccess />
            </ProtectedRoute>
          }
        />
        {ROUTER.map(
          (route) =>
            !route.layout && (
              <Route
                key={route.path}
                path={route.path}
                element={!route.protected ? route.component : <ProtectedRoute>{route.component}</ProtectedRoute>}
              />
            )
        )}
        {ROUTER.map(
          (route) =>
            route.layout && (
              <Route
                key={route.path}
                path={route.path}
                element={
                  !route.protected ? (
                    <Layout darkMode={route.darkMode}>{route.component}</Layout>
                  ) : (
                    <ProtectedRoute>
                      <BetaRoute>
                        <Layout darkMode={route.darkMode}>{route.component}</Layout>
                      </BetaRoute>
                    </ProtectedRoute>
                  )
                }
              />
            )
        )}
        <Route path="*" element={<Navigate replace to={LOGIN_URL} />} />
      </Routes>
    </GTMProvider>
  )
}
export default App

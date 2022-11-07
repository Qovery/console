import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import axios from 'axios'
import LogRocket from 'logrocket'
import posthog from 'posthog-js'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { selectUser } from '@qovery/domains/user'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'
import { PageLogin, PageLogoutFeature } from '@qovery/pages/login'
import { PageOnboarding } from '@qovery/pages/onboarding'
import { useAuth } from '@qovery/shared/auth'
import { UserInterface } from '@qovery/shared/interfaces'
import {
  BetaRoute,
  LOGIN_URL,
  LOGOUT_URL,
  NO_BETA_ACCESS_URL,
  NoBetaAccess,
  ONBOARDING_URL,
  ProtectedRoute,
} from '@qovery/shared/router'
import { LoadingScreen } from '@qovery/shared/ui'
import { useAuthInterceptor, useDocumentTitle } from '@qovery/shared/utils'
import { environment } from '../environments/environment'
import { ROUTER } from './router/main.router'

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading } = useAuth()

  const [, setBetaAccess] = useState(false)

  const gtmParams = { id: environment.gtm }

  const user = useSelector(selectUser)
  const { update: updateIntercom } = useIntercom()

  const initMonitorings = useCallback(
    (user: UserInterface) => {
      if (!user || !user.sub) return

      posthog.identify(user.sub, {
        ...user,
      })

      if (process.env['NODE_ENV'] === 'production') {
        LogRocket.identify(user.sub, {
          ...user,
        })
      }

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
        layout: false,
      })
    }

    // init logrocket
    if (process.env['NODE_ENV'] === 'production') {
      LogRocket.init(environment.logrocket)
    }
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      if (process.env['NODE_ENV'] !== 'production') {
        posthog.feature_flags.override(['v3-beta'])
        setBetaAccess(posthog.isFeatureEnabled('v3-beta'))
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
        <Route path={`${LOGIN_URL}/*`} element={<PageLogin />} />
        <Route path={LOGOUT_URL} element={<PageLogoutFeature />} />
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
                    <Layout darkMode={route.darkMode} topBar={route.topBar}>
                      <DarkModeEnabler key={'dark-mode-' + route.path} isDarkMode={route.darkMode}>
                        {route.component}
                      </DarkModeEnabler>
                    </Layout>
                  ) : (
                    <ProtectedRoute>
                      <BetaRoute>
                        <Layout darkMode={route.darkMode} topBar={route.topBar}>
                          <DarkModeEnabler key={'dark-mode-' + route.path} isDarkMode={route.darkMode}>
                            {route.component}
                          </DarkModeEnabler>
                        </Layout>
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

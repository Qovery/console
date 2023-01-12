import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import axios from 'axios'
import LogRocket from 'logrocket'
import posthog from 'posthog-js'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { selectUser } from '@qovery/domains/user'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'
import { PageLogin, PageLogoutFeature } from '@qovery/pages/login'
import { useAuth, useInviteMember } from '@qovery/shared/auth'
import { UserInterface } from '@qovery/shared/interfaces'
import { ProtectedRoute } from '@qovery/shared/router'
import { LOGIN_URL, LOGOUT_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { useAuthInterceptor, useDocumentTitle } from '@qovery/shared/utils'
import { environment } from '../environments/environment'
import ScrollToTop from './components/scroll-to-top'
import { ROUTER } from './router/main.router'

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading } = useAuth()
  const { redirectToAcceptPageGuard, onSearchUpdate, checkTokenInStorage } = useInviteMember()

  useEffect(() => {
    onSearchUpdate()
  }, [onSearchUpdate])

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  useEffect(() => {
    redirectToAcceptPageGuard()
  }, [redirectToAcceptPageGuard])

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
    // init logrocket
    if (process.env['NODE_ENV'] === 'production') {
      LogRocket.init(environment.logrocket)
    }
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      if (process.env['NODE_ENV'] === 'production') {
        initMonitorings(user)
      }
    }
  }, [user, initMonitorings])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <GTMProvider state={gtmParams}>
      <ScrollToTop />
      <Routes>
        <Route path={`${LOGIN_URL}/*`} element={<PageLogin />} />
        <Route path={LOGOUT_URL} element={<PageLogoutFeature />} />
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
                    <DarkModeEnabler key={'dark-mode-' + route.path} isDarkMode={route.darkMode}>
                      <Layout topBar={route.topBar}>{route.component}</Layout>
                    </DarkModeEnabler>
                  ) : (
                    <ProtectedRoute>
                      <DarkModeEnabler key={'dark-mode-' + route.path} isDarkMode={route.darkMode}>
                        <Layout topBar={route.topBar}>{route.component}</Layout>
                      </DarkModeEnabler>
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

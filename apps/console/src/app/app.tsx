import { type User, useAuth0 } from '@auth0/auth0-react'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import axios from 'axios'
import LogRocket from 'logrocket'
import posthog from 'posthog-js'
import { useCallback, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { KubeconfigPreview } from '@qovery/domains/clusters/feature'
import { HelmDefaultValuesPreview } from '@qovery/domains/service-helm/feature'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'
import { PageLogin, PageLogoutFeature } from '@qovery/pages/login'
import { useAuth, useInviteMember } from '@qovery/shared/auth'
import { ProtectedRoute } from '@qovery/shared/router'
import { HELM_DEFAULT_VALUES, KUBECONFIG, LOGIN_URL, LOGOUT_URL, PREVIEW_CODE } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useAuthInterceptor } from '@qovery/shared/utils'
import { environment } from '../environments/environment'
import PreviewCode from './components/preview-code'
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

  const { user } = useAuth0()
  const { update: updateIntercom } = useIntercom()

  const initMonitorings = useCallback(
    (user: User) => {
      if (!user || !user.sub) return

      posthog.identify(user.sub, {
        ...user,
      })

      if (process.env['NODE_ENV'] === 'production') {
        LogRocket.identify(user.sub, {
          ...user,
        })
      }
      const INTERCOM_HASH_KEY = 'https://qovery.com/intercom_hash'

      updateIntercom({
        email: user.email,
        name: user.name,
        userId: user.sub,
        userHash: user[INTERCOM_HASH_KEY],
      })
    },
    [updateIntercom]
  )

  // init axios interceptor
  useAuthInterceptor(axios, environment.api)

  useEffect(() => {
    // init logrocket
    if (process.env['NODE_ENV'] === 'production') {
      LogRocket.init(environment.logrocket, {
        release: process.env['NX_GIT_SHA'],
        dom: {
          inputSanitizer: true,
          textSanitizer: true,
        },
      })
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
        <Route path={PREVIEW_CODE} element={<PreviewCode />} />
        <Route path={HELM_DEFAULT_VALUES} element={<HelmDefaultValuesPreview />} />
        <Route path={KUBECONFIG} element={<KubeconfigPreview />} />
        {ROUTER.map((route) =>
          route.layout ? (
            <Route
              key={route.path}
              path={route.path}
              element={
                !route.protected ? (
                  <DarkModeEnabler isDarkMode={route.darkMode}>
                    <Layout topBar={route.topBar}>{route.component}</Layout>
                  </DarkModeEnabler>
                ) : (
                  <ProtectedRoute>
                    <DarkModeEnabler isDarkMode={route.darkMode}>
                      <Layout topBar={route.topBar}>{route.component}</Layout>
                    </DarkModeEnabler>
                  </ProtectedRoute>
                )
              }
            />
          ) : (
            <Route
              key={route.path}
              path={route.path}
              element={!route.protected ? route.component : <ProtectedRoute>{route.component}</ProtectedRoute>}
            />
          )
        )}
        <Route path="*" element={<Navigate replace to={LOGIN_URL} />} />
      </Routes>
    </GTMProvider>
  )
}
export default App

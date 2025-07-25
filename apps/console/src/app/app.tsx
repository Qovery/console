import { type User, useAuth0 } from '@auth0/auth0-react'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import * as Sentry from '@sentry/react'
import axios from 'axios'
import posthog from 'posthog-js'
import { useCallback, useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { KubeconfigPreview } from '@qovery/domains/clusters/feature'
import { HelmDefaultValuesPreview } from '@qovery/domains/service-helm/feature'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'
import { PageLogin, PageLogoutFeature } from '@qovery/pages/login'
import { AssistantContext } from '@qovery/shared/assistant/feature'
import { useAuth, useInviteMember } from '@qovery/shared/auth'
import { DEVOPS_COPILOT_API_BASE_URL, devopsCopilotAxios } from '@qovery/shared/devops-copilot/data-access'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/feature'
import { ProtectedRoute } from '@qovery/shared/router'
import { HELM_DEFAULT_VALUES, KUBECONFIG, LOGIN_URL, LOGOUT_URL, PREVIEW_CODE } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { GIT_SHA, GTM, NODE_ENV, QOVERY_API } from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'
import PreviewCode from './components/preview-code'
import ScrollToTop from './components/scroll-to-top'
import { ROUTER } from './router/main.router'

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading } = useAuth()
  const { redirectToAcceptPageGuard, onSearchUpdate, checkTokenInStorage } = useInviteMember()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [devopsCopilotOpen, setDevopsCopilotOpen] = useState(false)

  useEffect(() => {
    onSearchUpdate()
  }, [onSearchUpdate])

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  useEffect(() => {
    redirectToAcceptPageGuard()
  }, [redirectToAcceptPageGuard])

  const gtmParams = { id: GTM }

  const { user } = useAuth0()

  const initMonitorings = useCallback((user: User) => {
    if (!user || !user.sub) return

    posthog.identify(user.sub, {
      ...user,
    })
  }, [])

  // init axios interceptors
  useAuthInterceptor(axios, QOVERY_API)
  useAuthInterceptor(devopsCopilotAxios, DEVOPS_COPILOT_API_BASE_URL)

  useEffect(() => {
    // init Sentry
    if (NODE_ENV === 'production') {
      Sentry.init({
        release: GIT_SHA,
        dsn: 'https://666b0bd18086c3b730597ee1b8c97eb0@o471935.ingest.us.sentry.io/4507661194625024',
        integrations: [
          // See docs for support of different versions of variation of react router
          // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          }),
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for tracing.
        tracesSampleRate: 1.0,

        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
    }
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      initMonitorings(user)
    }
  }, [user, initMonitorings])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <GTMProvider state={gtmParams}>
      <DevopsCopilotContext.Provider value={{ devopsCopilotOpen, setDevopsCopilotOpen }}>
        <AssistantContext.Provider value={{ assistantOpen, setAssistantOpen }}>
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
                          <Layout topBar={route.topBar} spotlight={route.spotlight}>
                            {route.component}
                          </Layout>
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
        </AssistantContext.Provider>
      </DevopsCopilotContext.Provider>
    </GTMProvider>
  )
}
export default App

import { useEffect } from 'react'
import LogRocket from 'logrocket'
import posthog from 'posthog-js'
import axios from 'axios'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { Navigate, Routes, Route } from 'react-router-dom'
import {
  LOGIN_URL,
  OVERVIEW_URL,
  ProtectedRoute,
  useAuth,
  useDocumentTitle,
  useAuthInterceptor,
  ONBOARDING_URL,
  SETTINGS_URL,
} from '@console/shared/utils'
import { LoginPage } from '@console/pages/login/feature'
import { OverviewPage } from '@console/pages/overview/feature'
import { SettingsPage } from '@console/pages/settings/feature'
import { environment } from '../environments/environment'
import { LoadingScreen } from '@console/shared/ui'
import { OnboardingPage } from '@console/pages/onboarding/feature'

export const ROUTER = [
  {
    path: LOGIN_URL,
    component: <LoginPage />,
    protected: false,
  },
  {
    path: OVERVIEW_URL(),
    component: <OverviewPage />,
    protected: true,
  },
  {
    path: SETTINGS_URL(),
    component: <SettingsPage />,
    protected: true,
  },
]

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading, getCurrentUser } = useAuth()

  const gtmParams = { id: environment.gtm }

  // init axios interceptor
  useAuthInterceptor(axios, environment.api)

  useEffect(() => {
    // if (process.env['NODE_ENV'] === 'production') {

    // if onboarding feature flag activated we add onboarding routes to router
    if (posthog.isFeatureEnabled('v3-onboarding')) {
      ROUTER.push({
        path: `${ONBOARDING_URL}/*`,
        component: <OnboardingPage />,
        protected: true,
      })
    }

    // init logrocket
    LogRocket.init(environment.logrocket)
    // }
  }, [])

  useEffect(() => {
    async function fetchData() {
      await getCurrentUser()
    }
    fetchData()
  }, [getCurrentUser])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <GTMProvider state={gtmParams}>
      <Routes>
        <Route path={LOGIN_URL} element={<LoginPage />} />
        {ROUTER.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={!route.protected ? route.component : <ProtectedRoute>{route.component}</ProtectedRoute>}
          />
        ))}
        <Route path="*" element={<Navigate replace to={LOGIN_URL} />} />
      </Routes>
    </GTMProvider>
  )
}
export default App

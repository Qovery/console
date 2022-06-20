import { useEffect } from 'react'
import LogRocket from 'logrocket'
import axios from 'axios'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  APPLICATION_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  LOGIN_URL,
  ONBOARDING_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  ProtectedRoute,
  SERVICES_URL,
  SETTINGS_URL,
} from '@console/shared/router'
import { useAuth } from '@console/shared/auth'
import { useAuthInterceptor, useDocumentTitle } from '@console/shared/utils'
import { LoadingScreen } from '@console/shared/ui'
import { OverviewPage } from '@console/pages/overview/feature'
import { SettingsPage } from '@console/pages/settings/feature'
import { OnboardingPage } from '@console/pages/onboarding/feature'
import { InfraLogsPage } from '@console/pages/logs/infra/feature'
import { PageLogin } from '@console/pages/login'

import { useProjects } from '@console/domains/projects'
import { environment } from '../environments/environment'
import { Layout } from '@console/pages/layout'
import { PageServices } from '@console/pages/services'
import { PageApplication } from '@console/pages/application'
import { PageEnvironments } from '@console/pages/environments'
import { withAuthenticationRequired } from '@auth0/auth0-react'

function RedirectOverview() {
  const { organizationId } = useParams()
  const { getProjects } = useProjects()

  useEffect(() => {
    async function fetchProjects() {
      const projects: any = organizationId && (await getProjects(organizationId))
      if (projects?.payload.length > 0) {
        window.location.href = OVERVIEW_URL(organizationId, projects.payload[0].id)
      }
    }
    fetchProjects()
  }, [organizationId, getProjects])

  return <LoadingScreen />
}

export const ROUTER = [
  {
    path: LOGIN_URL,
    component: <PageLogin />,
    protected: false,
  },
  {
    path: ORGANIZATION_URL(),
    component: <RedirectOverview />,
    protected: true,
    layout: false,
  },
  {
    path: OVERVIEW_URL(),
    component: <OverviewPage />,
    protected: true,
    layout: true,
  },
  {
    path: SETTINGS_URL(),
    component: <SettingsPage />,
    protected: true,
    layout: true,
  },
  {
    path: `${ENVIRONMENTS_URL()}/*`,
    component: <PageEnvironments />,
    protected: true,
    layout: true,
  },
  {
    path: `${SERVICES_URL()}/*`,
    component: <PageServices />,
    protected: true,
    layout: true,
  },
  {
    path: `${APPLICATION_URL()}/*`,
    component: <PageApplication />,
    protected: true,
    layout: true,
  },
  {
    path: `${INFRA_LOGS_URL()}`,
    component: <InfraLogsPage />,
    protected: true,
    layout: true,
    darkMode: true,
  },
]

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading, checkIsAuthenticated, getCurrentUser } = useAuth()

  const gtmParams = { id: environment.gtm }

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

    if (window['Cypress']) {
      const auth0 = JSON.parse(localStorage.getItem('auth0Cypress')!)

      if (auth0) {
        localStorage.setItem(process.env['NX_OAUTH_TOKEN_NAME'] as string, auth0.token)
      }
    } else {
      fetchData()
    }
  }, [getCurrentUser])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <GTMProvider state={gtmParams}>
      <Routes>
        <Route path={LOGIN_URL} element={<PageLogin />} />
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
                      <Layout darkMode={route.darkMode}>{route.component}</Layout>
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

const app = window['Cypress'] ? App : withAuthenticationRequired(App)

export default app

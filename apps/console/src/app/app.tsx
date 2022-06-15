import { useEffect } from 'react'
import LogRocket from 'logrocket'
import axios from 'axios'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import {
  APPLICATION_URL,
  SERVICES_URL,
  ENVIRONMENTS_URL,
  LOGIN_URL,
  ONBOARDING_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  ProtectedRoute,
  SETTINGS_URL,
  INFRA_LOGS_URL,
} from '@console/shared/router'
import { useAuth } from '@console/shared/auth'
import { useAuthInterceptor, useDocumentTitle } from '@console/shared/utils'
import { LoadingScreen } from '@console/shared/ui'
import { OverviewPage } from '@console/pages/overview/feature'
import { SettingsPage } from '@console/pages/settings/feature'
import { EnvironmentsPage } from '@console/pages/environments/feature'
import { ServicesPage } from '@console/pages/services/feature'
import { OnboardingPage } from '@console/pages/onboarding/feature'
import { ApplicationPage } from '@console/pages/application/feature'
import { InfraLogsPage } from '@console/pages/logs/infra/feature'
import { PageLogin } from '@console/pages/login'
import { Layout } from '@console/shared/layout'
import { useProjects } from '@console/domains/projects'
import { environment } from '../environments/environment'

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
    component: <EnvironmentsPage />,
    protected: true,
    layout: true,
  },
  {
    path: `${SERVICES_URL()}/*`,
    component: <ServicesPage />,
    protected: true,
    layout: true,
  },
  {
    path: `${APPLICATION_URL()}/*`,
    component: <ApplicationPage />,
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
  const { isLoading, getCurrentUser } = useAuth()

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
    fetchData()
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
export default App

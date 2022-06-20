import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LogRocket from 'logrocket'
import axios from 'axios'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Project } from 'qovery-typescript-axios'
import {
  APPLICATION_URL,
  BetaRoute,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  LOGIN_URL,
  NO_BETA_ACCESS_URL,
  NoBetaAccess,
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
import { AppDispatch } from '@console/store/data'
import { OverviewPage } from '@console/pages/overview/feature'
import { SettingsPage } from '@console/pages/settings/feature'
import { PageOnboarding } from '@console/pages/onboarding'
import { InfraLogsPage } from '@console/pages/logs/infra/feature'
import { PageLogin } from '@console/pages/login'
import { fetchProjects } from '@console/domains/projects'
import { environment } from '../environments/environment'
import { Layout } from '@console/pages/layout'
import { PageServices } from '@console/pages/services'
import { PageApplication } from '@console/pages/application'
import { PageEnvironments } from '@console/pages/environments'
import { useSelector } from 'react-redux'
import { selectUser } from '@console/domains/user'
import posthog from 'posthog-js'

function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    async function fetchCurrentProjects() {
      const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
      if (projects.length > 0) {
        window.location.href = OVERVIEW_URL(organizationId, projects[0].id)
      }
    }
    fetchCurrentProjects()
  }, [organizationId, dispatch])

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
  const { isLoading } = useAuth()

  const gtmParams = { id: environment.gtm }

  const user = useSelector(selectUser)

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
    // }
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      posthog.identify(user.sub, {
        ...user,
      })
    }
  }, [user])

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

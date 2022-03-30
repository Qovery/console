import { useEffect } from 'react'
import LogRocket from 'logrocket'
import posthog from 'posthog-js'
import axios from 'axios'
import { Navigate, Routes, Route } from 'react-router-dom'
import {
  LOGIN_URL,
  OVERVIEW_URL,
  ProtectedRoute,
  useAuth,
  SetupInterceptor,
  useDocumentTitle,
} from '@console/shared/utils'
import { LoginPage } from '@console/pages/login/feature'
import { OverviewPage } from '@console/pages/overview/feature'
import { environment } from '../environments/environment'
import { LoadingScreen } from '@console/shared/ui'

export const ROUTER = [
  {
    path: LOGIN_URL,
    component: <LoginPage />,
    protected: false,
  },
  {
    path: OVERVIEW_URL,
    component: <OverviewPage />,
    protected: true,
  },
]

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading, getCurrentUser } = useAuth()

  // init axios interceptor
  SetupInterceptor(axios, environment.api)

  useEffect(() => {
    if (process.env['NODE_ENV'] === 'production') {
      // init posthug
      posthog.init(environment.posthog, {
        api_host: environment.posthog_apihost,
      })

      // init logrocket
      LogRocket.init(environment.logrocket)
    }
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
  )
}
export default App

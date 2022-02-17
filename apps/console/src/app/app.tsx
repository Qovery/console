import axios from 'axios'
import { Navigate, Routes, Route } from 'react-router-dom'
import {
  LOGIN_URL,
  OVERVIEW_URL,
  ONBOARDING_URL,
  ProtectedRoute,
  useAuth,
  SetupInterceptor,
} from '@console/shared/utils'
import { LoginPage } from '@console/pages/login/feature'
import { OverviewPage } from '@console/pages/overview/feature'
import { OnboardingPage } from '@console/pages/onboarding/feature'
import { environment } from '../environments/environment'

export const ROUTER = [
  {
    path: LOGIN_URL,
    component: <LoginPage />,
    protected: false,
  },
  {
    path: `${ONBOARDING_URL}/*`,
    component: <OnboardingPage />,
    protected: false,
  },
  {
    path: OVERVIEW_URL,
    component: <OverviewPage />,
    protected: true,
  },
]

export function App() {
  const { isLoading } = useAuth()

  // init axios interceptor
  SetupInterceptor(axios, environment.api)

  if (isLoading) {
    return <p>Loading...</p>
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

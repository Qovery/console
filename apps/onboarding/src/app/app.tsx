import axios from 'axios'
import { Navigate, Routes, Route } from 'react-router-dom'
import {
  LOGIN_URL,
  ONBOARDING_URL,
  ProtectedRoute,
  useAuth,
  SetupInterceptor,
  useDocumentTitle,
} from '@console/shared/utils'
import { LoginPage } from '@console/pages/login/feature'
import { OnboardingPage } from '@console/pages/onboarding/feature'
import { LoadingScreen } from '@console/shared/ui'
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
    protected: true,
  },
]

export function App() {
  useDocumentTitle('Loading...')
  const { isLoading } = useAuth()

  // init axios interceptor
  SetupInterceptor(axios, environment.api)

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

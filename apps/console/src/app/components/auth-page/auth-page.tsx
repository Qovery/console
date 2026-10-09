import { useEffect, useState } from 'react'
import { type AuthPage as AuthPageName, trackAuthPageViewed } from './auth-page-tracking'
import { getStoredLastUsedLogin } from './auth-page-utils'
import { LoginScreen } from './login-screen'
import { SignUpScreen } from './signup-screen'

export interface AuthPageProps {
  page: AuthPageName
  redirect?: string
}

export function AuthPage({ page, redirect }: AuthPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const trackingContext = { page }

  useEffect(() => {
    trackAuthPageViewed({ page }, Boolean(getStoredLastUsedLogin()))
  }, [page])

  if (page === 'signup' && !showLogin) {
    return (
      <SignUpScreen redirect={redirect} trackingContext={trackingContext} onLogInInstead={() => setShowLogin(true)} />
    )
  }

  return <LoginScreen redirect={redirect} trackingContext={trackingContext} />
}

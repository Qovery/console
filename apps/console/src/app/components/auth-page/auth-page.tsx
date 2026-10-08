import { useEffect, useRef, useState } from 'react'
import { AuthPageLayout, AuthPageLoadingCard, AuthPageLoadingVisual } from './auth-page-layout'
import { type AuthPage as AuthPageName, trackAuthPageViewed } from './auth-page-tracking'
import { getStoredLastUsedLogin } from './auth-page-utils'
import { LoginScreen } from './login-screen'
import { SignUpScreen } from './signup-screen'
import { useAuthPageVariant } from './use-auth-page-variant'

export interface AuthPageProps {
  page: AuthPageName
  redirect?: string
}

/**
 * /signup always shows the sign-up screen.
 * /login shows it only to visitors without a "Last used" method when `signup-page-v1` is `test`,
 * every other visitor gets the unchanged login screen.
 */
export function AuthPage({ page, redirect }: AuthPageProps) {
  // Frozen at page load: clicking a provider writes it, which must not switch the screen
  const [hasLastUsed] = useState(() => Boolean(getStoredLastUsedLogin()))
  const variantState = useAuthPageVariant({ page, hasLastUsed })
  const [showLogin, setShowLogin] = useState(false)
  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    if (variantState.status !== 'ready' || hasTrackedViewRef.current) {
      return
    }

    hasTrackedViewRef.current = true
    trackAuthPageViewed(
      { variant: variantState.variant, flag_variant: variantState.flag_variant },
      { page, has_last_used: hasLastUsed }
    )
  }, [variantState, page, hasLastUsed])

  if (variantState.status === 'loading') {
    return <AuthPageLayout card={<AuthPageLoadingCard />} visual={<AuthPageLoadingVisual />} />
  }

  // Events keep the variant the visitor was assigned to, even after switching to the login screen
  const trackingContext = { variant: variantState.variant, flag_variant: variantState.flag_variant }

  if (variantState.variant === 'test' && !showLogin) {
    return (
      <SignUpScreen redirect={redirect} trackingContext={trackingContext} onLogInInstead={() => setShowLogin(true)} />
    )
  }

  return <LoginScreen redirect={redirect} trackingContext={trackingContext} />
}

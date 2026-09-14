export const LOGIN_URL = '/login'
export const LOGIN_AUTH_REDIRECT_URL = '/auth0-callback'
export const LOGOUT_URL = '/logout'

// Marks a redirect to /login that was forced by an unusable session. The login page must not
// bounce such a visit back into the app: Auth0 caches the user in localStorage without an expiry
// check, so `isAuthenticated` can stay true for a session that can no longer mint a token, and
// the two redirects chase each other forever.
export const SESSION_EXPIRED_REASON = 'session-expired'

export function isLoginPath(pathname: string) {
  return pathname === LOGIN_URL || pathname.startsWith(`${LOGIN_URL}/`)
}

export function getSafeRedirect(redirectPath?: string) {
  if (!redirectPath || redirectPath.startsWith(LOGIN_URL)) {
    return '/'
  }

  return redirectPath
}

export function shouldRedirectAuthenticatedUser({
  isAuthenticated,
  reason,
}: {
  isAuthenticated: boolean
  reason?: string
}) {
  return isAuthenticated && reason !== SESSION_EXPIRED_REASON
}

import { redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthEnum, getSsoConnectionName } from '@qovery/shared/auth'
import { type AuthPage } from './auth-page-tracking'

export const LAST_USED_LOGIN_STORAGE_KEY = 'lastUsedLogin'
export const LAST_USED_SSO_DOMAIN_STORAGE_KEY = 'lastUsedSsoDomain'
export const SAML_SSO_LOGIN = 'saml_sso'
const AUTH_ENTRY_STORAGE_KEY = 'auth_entry'
export const SSO_DOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/

export const authPageSearchParamsSchema = z.object({
  redirect: z.string().optional(),
  // SAML / OIDC connection (or company domain) to send the user straight to their IdP
  connection: z.string().optional(),
})

export function getSafeRedirect(redirectPath?: string) {
  if (!redirectPath || redirectPath.startsWith('/login') || redirectPath.startsWith('/signup')) {
    return '/'
  }

  return redirectPath
}

export function rememberAuthEntry(screen: AuthPage, redirect?: string) {
  sessionStorage.setItem(AUTH_ENTRY_STORAGE_KEY, JSON.stringify({ screen, redirect: getSafeRedirect(redirect) }))
}

export function readAuthEntry(): { screen: AuthPage; redirect: string } {
  try {
    const entry = JSON.parse(sessionStorage.getItem(AUTH_ENTRY_STORAGE_KEY) ?? '')
    return { screen: entry.screen === 'signup' ? 'signup' : 'login', redirect: getSafeRedirect(entry.redirect) }
  } catch {
    return { screen: 'login', redirect: '/' }
  }
}

export function clearAuthEntry() {
  sessionStorage.removeItem(AUTH_ENTRY_STORAGE_KEY)
}

export function getStoredLastUsedLogin() {
  try {
    return window.localStorage.getItem(LAST_USED_LOGIN_STORAGE_KEY) ?? undefined
  } catch {
    return undefined
  }
}

export type TrackedAuthProvider = 'google' | 'github' | 'saml' | 'bitbucket' | 'gitlab' | 'microsoft'

const TRACKED_PROVIDERS: Record<string, TrackedAuthProvider> = {
  [AuthEnum.GOOGLE_SSO]: 'google',
  [AuthEnum.GITHUB]: 'github',
  [AuthEnum.BITBUCKET]: 'bitbucket',
  [AuthEnum.GITLAB]: 'gitlab',
  [AuthEnum.MICROSOFT]: 'microsoft',
  [SAML_SSO_LOGIN]: 'saml',
}

export function getTrackedProvider(lastUsedProvider: string): TrackedAuthProvider | undefined {
  return TRACKED_PROVIDERS[lastUsedProvider]
}

export async function authPageBeforeLoad({
  page,
  auth,
  search,
}: {
  page: AuthPage
  auth: { isAuthenticated: boolean; login: (returnTo?: string, connection?: string) => Promise<void> }
  search: z.infer<typeof authPageSearchParamsSchema>
}) {
  if (auth.isAuthenticated) {
    throw redirect({ to: getSafeRedirect(search.redirect) })
  }

  const connection = search.connection && getSsoConnectionName(search.connection)
  if (connection) {
    rememberAuthEntry(page, search.redirect)
    try {
      await auth.login(getSafeRedirect(search.redirect), connection)
    } catch (error) {
      // Fall back to the login form rather than failing the route
      console.error('SSO auto-connection failed:', error)
    }
  }
}

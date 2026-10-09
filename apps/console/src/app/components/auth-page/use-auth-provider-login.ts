import { useEffect, useState } from 'react'
import { useAuth } from '@qovery/shared/auth'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { type AuthPage, type AuthPageTrackingContext, trackAuthProviderClicked } from './auth-page-tracking'
import {
  AUTH_ENTRY_SCREEN_STORAGE_KEY,
  LAST_USED_LOGIN_STORAGE_KEY,
  LAST_USED_SSO_DOMAIN_STORAGE_KEY,
  getSafeRedirect,
  getTrackedProvider,
} from './auth-page-utils'

export function useAuthProviderLogin({
  screen,
  redirect,
  trackingContext,
}: {
  screen: AuthPage
  redirect?: string
  trackingContext: AuthPageTrackingContext
}) {
  const { authLogin } = useAuth()
  const [, setLastUsedLogin] = useLocalStorage<string | undefined>(LAST_USED_LOGIN_STORAGE_KEY, undefined)
  const [loading, setLoading] = useState<{ provider: string; active: boolean } | undefined>()

  const login = async (provider: string, lastUsedProvider = provider) => {
    setLoading({
      provider: provider,
      active: true,
    })

    setLastUsedLogin(lastUsedProvider)
    sessionStorage.setItem(AUTH_ENTRY_SCREEN_STORAGE_KEY, screen)

    const trackedProvider = getTrackedProvider(lastUsedProvider)
    if (trackedProvider) {
      trackAuthProviderClicked(trackingContext, trackedProvider)
    }

    try {
      await authLogin(provider, getSafeRedirect(redirect))
    } catch (error) {
      console.error(error)
      setLoading(undefined)
    }
  }

  const isLoading = (provider: string) => (loading?.provider === provider ? loading.active : false)

  return { login, isLoading }
}

interface Auth0Error {
  error: string
  error_description?: string
}

export function useAuth0Error() {
  const [auth0Error, setAuth0Error] = useState<Auth0Error | null>(null)

  useEffect(() => {
    const error = sessionStorage.getItem('auth0_error')
    const errorDescription = sessionStorage.getItem('auth0_error_description')

    if (error) {
      // Keep the domain pre-filled for this visit so it can be fixed, but don't suggest it again next time
      localStorage.removeItem(LAST_USED_SSO_DOMAIN_STORAGE_KEY)

      setAuth0Error({
        error,
        error_description: errorDescription || 'NO_DESCRIPTION',
      })

      sessionStorage.removeItem('auth0_error')
      sessionStorage.removeItem('auth0_error_description')
    }
  }, [])

  return { auth0Error, setAuth0Error }
}

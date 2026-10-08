import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { type AuthPage, type AuthPageFlagVariant, type AuthPageTrackingContext } from './auth-page-tracking'

export const SIGNUP_PAGE_FLAG_KEY = 'signup-page-v1'
export const SIGNUP_PAGE_FLAG_TIMEOUT_MS = 1000

export type AuthPageVariantState = { status: 'loading' } | ({ status: 'ready' } & AuthPageTrackingContext)

function getFlagVariant(): AuthPageFlagVariant {
  const value = posthog.getFeatureFlag(SIGNUP_PAGE_FLAG_KEY)
  return value === 'test' || value === 'control' ? value : 'unavailable'
}

/**
 * Resolves which auth screen to display, once per page load (the screen never switches afterwards).
 * The flag is only read for /login visitors without a "Last used" method: reading it counts an experiment
 * exposure in PostHog, which must not happen for visitors who can never see the sign-up variant.
 */
export function useAuthPageVariant({ page, hasLastUsed }: { page: AuthPage; hasLastUsed: boolean }) {
  const shouldEvaluateFlag = page === 'login' && !hasLastUsed
  const [state, setState] = useState<AuthPageVariantState>(() => {
    if (page === 'signup') {
      return { status: 'ready', variant: 'test', flag_variant: 'not_evaluated' }
    }
    if (hasLastUsed) {
      return { status: 'ready', variant: 'control', flag_variant: 'not_evaluated' }
    }
    return { status: 'loading' }
  })
  const isLoading = state.status === 'loading'

  useEffect(() => {
    if (!shouldEvaluateFlag || !isLoading) {
      return
    }

    // Plain posthog API rather than `useFeatureFlagVariantKey`: we need to know when flags are loaded,
    // so a missing flag resolves immediately instead of waiting for the timeout.
    let unsubscribe: (() => void) | undefined
    const timeout = setTimeout(() => {
      unsubscribe?.()
      setState({ status: 'ready', variant: 'control', flag_variant: 'timeout' })
    }, SIGNUP_PAGE_FLAG_TIMEOUT_MS)

    try {
      // Called synchronously when flags are already loaded
      unsubscribe = posthog.onFeatureFlags(() => {
        clearTimeout(timeout)
        unsubscribe?.()
        const flagVariant = getFlagVariant()
        setState({ status: 'ready', variant: flagVariant === 'test' ? 'test' : 'control', flag_variant: flagVariant })
      })
    } catch (error) {
      // PostHog not initialized: let the timeout fall back to control
      console.error(error)
    }

    return () => {
      clearTimeout(timeout)
      unsubscribe?.()
    }
  }, [shouldEvaluateFlag, isLoading])

  return state
}

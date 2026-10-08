import posthog from 'posthog-js'
import { type TrackedAuthProvider } from './auth-page-utils'

export type AuthPage = 'login' | 'signup'
export type AuthPageVariant = 'control' | 'test'
// Raw value of the `signup-page-v1` flag, or why it was not used:
// - `timeout`: flags were not loaded within the wait budget, control was shown
// - `not_evaluated`: the flag was never read (/signup, or returning visitor with a "Last used" method)
// - `unavailable`: flags loaded but `signup-page-v1` resolved to neither `control` nor `test` (missing or disabled flag)
export type AuthPageFlagVariant = 'control' | 'test' | 'timeout' | 'not_evaluated' | 'unavailable'

export interface AuthPageTrackingContext {
  variant: AuthPageVariant
  flag_variant: AuthPageFlagVariant
}

export function trackAuthPageViewed(
  context: AuthPageTrackingContext,
  properties: { page: AuthPage; has_last_used: boolean }
) {
  posthog.capture('auth_page_viewed', { ...context, ...properties })
}

export function trackAuthProviderClicked(context: AuthPageTrackingContext, provider: TrackedAuthProvider) {
  // The page redirects to Auth0 right after: don't wait for the next batch
  posthog.capture('auth_provider_clicked', { ...context, provider }, { send_instantly: true })
}

export function trackAuthSecondaryCtaClicked(context: AuthPageTrackingContext, cta: 'book_demo' | 'log_in_instead') {
  posthog.capture('auth_secondary_cta_clicked', { ...context, cta })
}

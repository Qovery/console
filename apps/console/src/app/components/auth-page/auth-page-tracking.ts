import posthog from 'posthog-js'
import { type TrackedAuthProvider } from './auth-page-utils'

export type AuthPage = 'login' | 'signup'

export interface AuthPageTrackingContext {
  page: AuthPage
}

export function trackAuthPageViewed(context: AuthPageTrackingContext, hasLastUsed: boolean) {
  posthog.capture('auth_page_viewed', { ...context, has_last_used: hasLastUsed })
}

export function trackAuthProviderClicked(context: AuthPageTrackingContext, provider: TrackedAuthProvider) {
  posthog.capture('auth_provider_clicked', { ...context, provider }, { send_instantly: true })
}

export function trackAuthSecondaryCtaClicked(context: AuthPageTrackingContext, cta: 'log_in_instead') {
  posthog.capture('auth_secondary_cta_clicked', { ...context, cta })
}

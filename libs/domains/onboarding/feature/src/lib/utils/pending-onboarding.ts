import { type ProfileFormValues } from '../step-personalize/step-personalize'

export interface PendingOnboarding {
  organizationId: string
  projectId?: string
  profile: ProfileFormValues
}

const storageKey = (userId: string) => `onboarding-pending:${userId}`

// Keep successful creation IDs across reloads until navigation completes. The
// authenticated subject scopes recovery to this account in this browser session.
export function readPendingOnboarding(userId?: string): PendingOnboarding | undefined {
  if (!userId) return
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey(userId)) ?? 'null')
    if (
      value &&
      typeof value.organizationId === 'string' &&
      value.organizationId &&
      (value.projectId === undefined || typeof value.projectId === 'string') &&
      typeof value.profile?.full_name === 'string' &&
      typeof value.profile?.company_name === 'string' &&
      typeof value.profile?.phone === 'string'
    ) {
      return value
    }
  } catch {
    // Storage may be unavailable or contain an invalid record.
  }
  return undefined
}

export function savePendingOnboarding(userId: string | undefined, value: PendingOnboarding | undefined) {
  if (!userId) return
  try {
    if (value) sessionStorage.setItem(storageKey(userId), JSON.stringify(value))
    else sessionStorage.removeItem(storageKey(userId))
  } catch {
    // In-memory recovery remains available when session storage is disabled.
  }
}

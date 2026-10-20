export interface ProfileFormValues {
  full_name: string
  user_email: string
  organization_name: string
  company_name: string
  phone: string
}

export interface PendingOnboarding {
  organizationId: string
  projectId?: string
  completionTracked?: boolean
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
      (value.completionTracked === undefined || typeof value.completionTracked === 'boolean') &&
      ['full_name', 'company_name', 'phone', 'user_email', 'organization_name'].every(
        (field) => typeof value.profile?.[field] === 'string'
      )
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
  } catch (error) {
    // In-memory recovery remains available when session storage is disabled.
    console.error(error)
  }
}

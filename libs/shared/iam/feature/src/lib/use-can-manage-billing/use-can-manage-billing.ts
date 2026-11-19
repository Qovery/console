import { useUserRole } from '../use-user-role/use-user-role'

// Roles that q-core grants MANAGE_BILLING to. Custom roles never get it, and their names cannot reuse these.
export const BILLING_MANAGER_ROLES = ['owner', 'admin', 'billing'] as const

export interface CanManageBillingParams {
  roles?: string[]
  organizationId: string
  isQoveryAdminUser?: boolean
}

/**
 * UX gate only: the API stays the authority on billing permissions.
 * Matches the exact role claim `organization:{organizationId}:{owner|admin|billing}`.
 */
export function canManageBilling({ roles = [], organizationId, isQoveryAdminUser = false }: CanManageBillingParams) {
  if (isQoveryAdminUser) return true
  if (!organizationId) return false

  const allowedRoles = BILLING_MANAGER_ROLES.map((role) => `organization:${organizationId}:${role}`)
  return roles.some((role) => allowedRoles.includes(role))
}

export function useCanManageBilling(organizationId: string) {
  const { roles, loading, isQoveryAdminUser } = useUserRole()

  return {
    canManageBilling: canManageBilling({ roles, organizationId, isQoveryAdminUser }),
    loading,
  }
}

export default useCanManageBilling

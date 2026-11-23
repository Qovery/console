import { useUserRole } from '@qovery/shared/iam/feature'
import { canManagePolicyTokens } from '../../utils/can-manage-policy-tokens'

/** Decided from the user's organization role before any request. */
export function useCanManagePolicyTokens({ organizationId }: { organizationId: string }) {
  const { roles, loading, isQoveryAdminUser } = useUserRole()
  return { canManage: canManagePolicyTokens({ roles, organizationId, isQoveryAdminUser }), isLoading: loading }
}

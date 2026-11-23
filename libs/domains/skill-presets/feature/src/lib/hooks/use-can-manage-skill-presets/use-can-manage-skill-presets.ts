import { useUserRole } from '@qovery/shared/iam/feature'
import { canManageSkillPresets } from '../../utils/can-manage-skill-presets'

/**
 * Decided from the user's organization role before any request, so non-admins never see admin
 * controls, not even while the page loads.
 */
export function useCanManageSkillPresets({ organizationId }: { organizationId: string }) {
  const { roles, loading, isQoveryAdminUser } = useUserRole()
  return { canManage: canManageSkillPresets({ roles, organizationId, isQoveryAdminUser }), isLoading: loading }
}

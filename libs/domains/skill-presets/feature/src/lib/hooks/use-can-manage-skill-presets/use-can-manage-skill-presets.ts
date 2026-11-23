import { getSkillPresetsMockCanManage } from '@qovery/domains/skill-presets/mock'
import { useUserRole } from '@qovery/shared/iam/feature'
import { canManageSkillPresets } from '../../utils/can-manage-skill-presets'

/**
 * Decided from the user's organization role before any request, so non-admins never see admin
 * controls, not even while the page loads. In mock mode the scenario decides instead.
 */
export function useCanManageSkillPresets({ organizationId }: { organizationId: string }) {
  const { roles, loading, isQoveryAdminUser } = useUserRole()
  const mockCanManage = getSkillPresetsMockCanManage()
  if (mockCanManage !== null) return { canManage: mockCanManage, isLoading: false }
  return { canManage: canManageSkillPresets({ roles, organizationId, isQoveryAdminUser }), isLoading: loading }
}

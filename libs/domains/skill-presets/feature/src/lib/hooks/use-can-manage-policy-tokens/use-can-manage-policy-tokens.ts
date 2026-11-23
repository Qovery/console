import { getSkillPresetsMockCanManage } from '@qovery/domains/skill-presets/data-access'
import { useUserRole } from '@qovery/shared/iam/feature'
import { canManagePolicyTokens } from '../../utils/can-manage-policy-tokens'

/** Decided from the user's organization role before any request. In mock mode the scenario decides instead. */
export function useCanManagePolicyTokens({ organizationId }: { organizationId: string }) {
  const { roles, loading, isQoveryAdminUser } = useUserRole()
  const mockCanManage = getSkillPresetsMockCanManage()
  if (mockCanManage !== null) return { canManage: mockCanManage, isLoading: false }
  return { canManage: canManagePolicyTokens({ roles, organizationId, isQoveryAdminUser }), isLoading: loading }
}

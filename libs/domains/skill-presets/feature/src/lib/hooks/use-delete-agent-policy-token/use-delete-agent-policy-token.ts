import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeletePolicyApiToken } from '@qovery/domains/organizations/feature'
import { deleteMockPolicyToken, getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Deletes a policy token: the same mutation as the policy token settings, or the mock organization's
 * token in mock mode.
 */
export function useDeleteAgentPolicyToken({ organizationId }: { organizationId: string }) {
  const isMock = getSkillPresetsMockScenario() !== null
  const queryClient = useQueryClient()
  const { mutateAsync: deleteRealToken } = useDeletePolicyApiToken()
  return useMutation({
    mutationFn: (policyApiTokenId: string) =>
      isMock ? deleteMockPolicyToken(policyApiTokenId) : deleteRealToken({ organizationId, policyApiTokenId }),
    onSuccess: () => {
      if (isMock) {
        queryClient.invalidateQueries({ queryKey: queries.skillPresets.mockPolicyTokens({ organizationId }).queryKey })
      }
    },
  })
}

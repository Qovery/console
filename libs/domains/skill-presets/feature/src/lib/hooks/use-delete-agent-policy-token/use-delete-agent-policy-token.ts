import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeletePolicyApiToken } from '@qovery/domains/organizations/feature'
import { queries } from '@qovery/state/util-queries'

/**
 * Deletes a policy token with the same mutation as the policy token settings, then refreshes the
 * agent activity so the deleted token shows as a greyed row right away.
 */
export function useDeleteAgentPolicyToken({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()
  const { mutateAsync: deletePolicyApiToken } = useDeletePolicyApiToken()
  return useMutation({
    mutationFn: (policyApiTokenId: string) => deletePolicyApiToken({ organizationId, policyApiTokenId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.skillPresets.agentActivity._def })
    },
  })
}

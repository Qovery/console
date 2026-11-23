import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

/** The organization's policy tokens. Same query and cache as the policy token settings page. */
export function useAgentExperiencePolicyTokens({
  organizationId,
  enabled = true,
}: {
  organizationId: string
  enabled?: boolean
}) {
  return useQuery({
    ...queries.organizations.policyApiTokens({ organizationId }),
    enabled: enabled && Boolean(organizationId),
    retry: false,
  })
}

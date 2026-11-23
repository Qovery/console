import { useQuery } from '@tanstack/react-query'
import { getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * The organization's policy tokens (owners and admins). Same query and cache as the policy token
 * settings page. In mock mode, the mock organization's tokens are used instead.
 */
export function useAgentExperiencePolicyTokens({
  organizationId,
  enabled = true,
}: {
  organizationId: string
  enabled?: boolean
}) {
  const isMock = getSkillPresetsMockScenario() !== null
  const mock = useQuery({
    ...queries.skillPresets.mockPolicyTokens({ organizationId }),
    enabled: enabled && Boolean(organizationId) && isMock,
    retry: false,
  })
  const real = useQuery({
    ...queries.organizations.policyApiTokens({ organizationId }),
    enabled: enabled && Boolean(organizationId) && !isMock,
    retry: false,
  })
  return isMock ? mock : real
}

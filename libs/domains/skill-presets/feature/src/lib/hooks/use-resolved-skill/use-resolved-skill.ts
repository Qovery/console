import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

/**
 * The full text the member's agent gets for one skill, with the team context. Fetched only when the
 * member opens it: q-core records each call as a LOAD in the audit logs.
 */
export function useResolvedSkill({
  organizationId,
  skillName,
  enabled,
}: {
  organizationId: string
  skillName: string
  enabled: boolean
}) {
  return useQuery({
    ...queries.skillPresets.resolvedSkill({ organizationId, skillName }),
    enabled: enabled && Boolean(organizationId),
    staleTime: Infinity,
    retry: false,
  })
}

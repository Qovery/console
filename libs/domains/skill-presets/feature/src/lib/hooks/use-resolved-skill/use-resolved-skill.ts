import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

/**
 * The full text the member's agent gets for one skill, with the team context. Fetched each time the
 * member opens it, as a VIEW: q-core audits it but does not count it as an agent load. Never kept
 * fresh forever: a newer preset revision changes the text.
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
    staleTime: 0,
    // One audited view per opening.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}

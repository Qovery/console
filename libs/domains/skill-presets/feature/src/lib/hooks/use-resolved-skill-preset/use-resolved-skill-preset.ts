import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

/** What the current member's agent receives: any member may read it. */
export function useResolvedSkillPreset({
  organizationId,
  enabled = true,
}: {
  organizationId: string
  enabled?: boolean
}) {
  return useQuery({
    ...queries.skillPresets.resolved({ organizationId }),
    enabled: enabled && Boolean(organizationId),
    retry: false,
  })
}

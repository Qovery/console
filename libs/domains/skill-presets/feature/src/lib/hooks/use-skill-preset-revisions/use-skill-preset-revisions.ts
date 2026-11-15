import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillPresetRevisionsProps {
  organizationId: string
  /** Omit to get the latest revisions of every preset, deleted ones included. */
  skillPresetId?: string
  enabled?: boolean
}

export function useSkillPresetRevisions({
  organizationId,
  skillPresetId,
  enabled = true,
}: UseSkillPresetRevisionsProps) {
  return useQuery({
    ...queries.skillPresets.revisions({ organizationId, skillPresetId }),
    enabled: enabled && Boolean(organizationId),
    retry: false,
  })
}

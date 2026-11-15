import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillPresetRevisionsProps {
  organizationId: string
  /** Omit to get the latest revisions of every preset, deleted ones included. */
  skillPresetId?: string
  /** 1 to 100. Defaults to the API maximum. */
  limit?: number
}

export function useSkillPresetRevisions({ organizationId, skillPresetId, limit }: UseSkillPresetRevisionsProps) {
  return useQuery({
    ...queries.skillPresets.revisions({ organizationId, skillPresetId, limit }),
    enabled: Boolean(organizationId),
    retry: false,
  })
}

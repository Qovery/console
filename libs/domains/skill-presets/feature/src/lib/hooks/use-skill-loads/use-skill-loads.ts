import { useQuery } from '@tanstack/react-query'
import { type SkillLoadsParams, toSkillLoadPage } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillLoadsProps extends SkillLoadsParams {
  organizationId: string
}

export function useSkillLoads({ organizationId, ...params }: UseSkillLoadsProps) {
  return useQuery({
    ...queries.skillPresets.loads({ organizationId, ...params }),
    select: toSkillLoadPage,
    enabled: Boolean(organizationId),
    keepPreviousData: true,
    retry: false,
  })
}

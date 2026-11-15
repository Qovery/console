import { useQuery } from '@tanstack/react-query'
import { type SkillPresetUsageParams } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

export function useSkillPresetUsage({
  organizationId,
  ...params
}: { organizationId: string } & SkillPresetUsageParams) {
  return useQuery({
    ...queries.skillPresets.usage({ organizationId, ...params }),
    enabled: Boolean(organizationId),
    keepPreviousData: true,
    retry: false,
  })
}

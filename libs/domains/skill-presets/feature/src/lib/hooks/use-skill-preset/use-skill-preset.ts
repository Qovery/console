import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillPresetProps {
  skillPresetId?: string
}

export function useSkillPreset({ skillPresetId = '' }: UseSkillPresetProps) {
  return useQuery({
    ...queries.skillPresets.details({ skillPresetId }),
    enabled: Boolean(skillPresetId),
    retry: false,
  })
}

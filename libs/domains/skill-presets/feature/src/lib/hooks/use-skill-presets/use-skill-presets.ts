import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillPresetsProps {
  organizationId: string
  enabled?: boolean
}

export function useSkillPresets({ organizationId, enabled = true }: UseSkillPresetsProps) {
  return useQuery({
    ...queries.skillPresets.list({ organizationId }),
    enabled: enabled && Boolean(organizationId),
    retry: false,
  })
}

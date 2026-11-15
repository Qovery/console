import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSkillPresetsProps {
  organizationId: string
  /** Filters on the template flag. Omit for every preset, templates included. */
  isTemplate?: boolean
  enabled?: boolean
}

export function useSkillPresets({ organizationId, isTemplate, enabled = true }: UseSkillPresetsProps) {
  return useQuery({
    ...queries.skillPresets.list({ organizationId, isTemplate }),
    enabled: enabled && Boolean(organizationId),
    retry: false,
  })
}

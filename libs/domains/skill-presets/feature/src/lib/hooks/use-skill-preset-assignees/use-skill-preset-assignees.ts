import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useSkillPresetAssignees({ organizationId }: { organizationId: string }) {
  return useQuery({
    ...queries.skillPresets.assignees({ organizationId }),
    enabled: Boolean(organizationId),
  })
}

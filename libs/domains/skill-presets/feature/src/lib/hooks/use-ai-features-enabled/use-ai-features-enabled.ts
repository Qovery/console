import { useQuery } from '@tanstack/react-query'
import { getSkillPresetsMockAiFeaturesEnabled } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Every preset save is reviewed by a model, so q-core refuses writes when the organization turned
 * AI features off. Reads keep working. Unknown (loading, or an older API without the field) counts
 * as on: q-core still refuses, and the editor then shows its answer.
 */
export function useAiFeaturesEnabled({ organizationId }: { organizationId: string }) {
  const mockEnabled = getSkillPresetsMockAiFeaturesEnabled()
  const { data: organization } = useQuery({
    ...queries.organizations.details({ organizationId }),
    enabled: Boolean(organizationId) && mockEnabled === null,
  })
  if (mockEnabled !== null) return mockEnabled
  return organization?.ai_features_enabled !== false
}

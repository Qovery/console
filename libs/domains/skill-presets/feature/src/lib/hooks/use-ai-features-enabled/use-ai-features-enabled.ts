import { useQuery } from '@tanstack/react-query'
import { getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Every preset save is reviewed by a model, so q-core refuses writes when the organization turned
 * AI features off. Reads keep working. Unknown (loading, or an older API without the field) counts
 * as on: q-core still refuses, and the editor then shows its answer. In mock mode the mock
 * organization's flag is used, so turning it on can be demoed.
 */
export function useAiFeaturesEnabled({ organizationId }: { organizationId: string }) {
  const isMock = getSkillPresetsMockScenario() !== null
  const { data: organization } = useQuery({
    ...queries.organizations.details({ organizationId }),
    enabled: Boolean(organizationId) && !isMock,
  })
  const { data: mockEnabled } = useQuery({
    ...queries.skillPresets.mockAiFeatures({ organizationId }),
    enabled: Boolean(organizationId) && isMock,
  })
  if (isMock) return mockEnabled !== false
  return organization?.ai_features_enabled !== false
}

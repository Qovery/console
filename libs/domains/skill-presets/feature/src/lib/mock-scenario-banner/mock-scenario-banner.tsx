import { Suspense, lazy } from 'react'
import { getSkillPresetsMockScenario, loadSkillPresetsMockTools } from '@qovery/domains/skill-presets/data-access'

// The mock tools hold an unsafe text sample for testing: they load only when the mock is active.
const LazyBanner = lazy(async () => {
  const [
    { SKILL_PRESETS_MOCK_SCENARIO_DESCRIPTIONS, MOCK_UNSAFE_SAMPLE, MOCK_MODEL_ONLY_SAMPLE },
    { MockScenarioBannerContent },
  ] = await Promise.all([loadSkillPresetsMockTools(), import('./mock-scenario-banner-content')])
  return {
    default: ({ scenario }: { scenario: NonNullable<ReturnType<typeof getSkillPresetsMockScenario>> }) => (
      <MockScenarioBannerContent
        scenario={scenario}
        descriptions={SKILL_PRESETS_MOCK_SCENARIO_DESCRIPTIONS}
        unsafeSample={MOCK_UNSAFE_SAMPLE}
        modelOnlySample={MOCK_MODEL_ONLY_SAMPLE}
      />
    ),
  }
})

/**
 * Builds with `NX_PUBLIC_SKILL_PRESETS_MOCK=true` only: a dev bar at the bottom of the window that says
 * the page shows mock data and switches scenario.
 */
export function MockScenarioBanner() {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return null
  return (
    <Suspense fallback={null}>
      <LazyBanner scenario={scenario} />
      {/* Room for the fixed bar, so it never covers the end of the page. */}
      <div aria-hidden="true" className="order-last h-12" />
    </Suspense>
  )
}

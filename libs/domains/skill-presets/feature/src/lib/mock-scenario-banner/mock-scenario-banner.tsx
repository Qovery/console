import {
  MOCK_UNSAFE_SAMPLE,
  SKILL_PRESETS_MOCK_SCENARIOS,
  SKILL_PRESETS_MOCK_SCENARIO_DESCRIPTIONS,
  getSkillPresetsMockScenario,
  switchSkillPresetsMockScenario,
} from '@qovery/domains/skill-presets/data-access'
import { Button, CopyButton, Icon, InputSelectSmall } from '@qovery/shared/ui'

/** Dev and preview only: shows that the page runs on mock data and switches scenario. */
export function MockScenarioBanner() {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return null

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-neutral bg-surface-neutral-subtle px-3 py-2 text-xs text-neutral"
      data-testid="mock-scenario-banner"
    >
      <Icon iconName="flask" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
      <span className="font-medium">Mock data</span>
      <InputSelectSmall
        name="mock-scenario"
        ariaLabel="Mock scenario"
        className="w-48"
        defaultValue={scenario}
        items={SKILL_PRESETS_MOCK_SCENARIOS.map((value) => ({ label: value, value }))}
        onChange={(value) => value && switchSkillPresetsMockScenario(value as typeof scenario)}
      />
      <span className="text-neutral-subtle">
        {SKILL_PRESETS_MOCK_SCENARIO_DESCRIPTIONS[scenario]}. Resets on reload.
      </span>
      {scenario === 'security-rejection' && (
        <span className="flex items-center gap-1">
          <span className="text-neutral-subtle">Unsafe sample:</span>
          <CopyButton content={MOCK_UNSAFE_SAMPLE} size="xs" />
        </span>
      )}
      <Button
        type="button"
        size="xs"
        variant="plain"
        color="neutral"
        className="ml-auto"
        onClick={() => switchSkillPresetsMockScenario('off')}
      >
        Use the API
      </Button>
    </div>
  )
}

export default MockScenarioBanner

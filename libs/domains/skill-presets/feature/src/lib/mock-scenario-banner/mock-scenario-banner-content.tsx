import {
  SKILL_PRESETS_MOCK_SCENARIOS,
  type SkillPresetsMockScenario,
  switchSkillPresetsMockScenario,
} from '@qovery/domains/skill-presets/data-access'
import { Badge, Button, CopyButton, Icon, InputSelectSmall } from '@qovery/shared/ui'

export interface MockScenarioBannerContentProps {
  scenario: SkillPresetsMockScenario
  descriptions: Record<SkillPresetsMockScenario, string>
  unsafeSample: string
  modelOnlySample: string
}

/** Loaded only when the mock is active, with the mock tools: see `MockScenarioBanner`. */
export function MockScenarioBannerContent({
  scenario,
  descriptions,
  unsafeSample,
  modelOnlySample,
}: MockScenarioBannerContentProps) {
  return (
    <div
      role="status"
      aria-label="Mock data"
      className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-neutral bg-surface-neutral-subtle px-3 py-2 text-xs text-neutral"
      data-testid="mock-scenario-banner"
    >
      <Badge variant="surface" className="gap-1">
        <Icon iconName="flask" iconStyle="regular" aria-hidden="true" />
        Mock data
      </Badge>
      <InputSelectSmall
        name="mock-scenario"
        ariaLabel="Mock scenario"
        className="w-48"
        defaultValue={scenario}
        items={SKILL_PRESETS_MOCK_SCENARIOS.map((value) => ({ label: value, value }))}
        onChange={(value) => value && switchSkillPresetsMockScenario(value as SkillPresetsMockScenario)}
      />
      {scenario !== 'typical' && (
        <span className="font-medium text-neutral" data-testid="mock-scenario-name">
          Scenario: {scenario}
        </span>
      )}
      <span className="text-neutral-subtle">{descriptions[scenario]}. Data resets on reload.</span>
      {(scenario === 'security-rejection' || scenario === 'model-rejection') && (
        <span className="flex items-center gap-1">
          <span className="text-neutral-subtle">
            {scenario === 'security-rejection' ? 'Unsafe sample:' : 'Reworded sample:'}
          </span>
          <CopyButton content={scenario === 'security-rejection' ? unsafeSample : modelOnlySample} size="xs" />
        </span>
      )}
      <span className="ml-auto flex items-center gap-1">
        {scenario !== 'typical' && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            color="neutral"
            onClick={() => switchSkillPresetsMockScenario('typical')}
          >
            Reset to typical
          </Button>
        )}
        <Button
          type="button"
          size="xs"
          variant="plain"
          color="neutral"
          onClick={() => switchSkillPresetsMockScenario('off')}
        >
          Use the API
        </Button>
      </span>
    </div>
  )
}

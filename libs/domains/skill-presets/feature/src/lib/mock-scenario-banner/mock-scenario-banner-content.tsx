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
}

/** Loaded only when the mock is active, with the mock tools: see `MockScenarioBanner`. */
export function MockScenarioBannerContent({ scenario, descriptions, unsafeSample }: MockScenarioBannerContentProps) {
  return (
    <div
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
      <span className="text-neutral-subtle">{descriptions[scenario]}. Resets on reload.</span>
      {scenario === 'security-rejection' && (
        <span className="flex items-center gap-1">
          <span className="text-neutral-subtle">Unsafe sample:</span>
          <CopyButton content={unsafeSample} size="xs" />
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

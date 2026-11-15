export const SKILL_PRESETS_MOCK_SCENARIOS = [
  'empty',
  'typical',
  'conflicts',
  'security-rejection',
  'large',
  'errors',
  'slow',
  'member',
] as const
export type SkillPresetsMockScenario = (typeof SKILL_PRESETS_MOCK_SCENARIOS)[number]

export const SKILL_PRESETS_MOCK_SCENARIOS = [
  'empty',
  'typical',
  'conflicts',
  'security-rejection',
  'model-rejection',
  'review-unavailable',
  'ai-features-off',
  'large',
  'errors',
  'slow',
  'member',
  'member-no-preset',
  'agent-activity',
  'agent-activity-empty',
  'agent-activity-timeout',
  'agent-experience-empty',
  'agent-experience-partial',
  'agent-experience-active',
  'agent-experience-copilot-error',
] as const
export type SkillPresetsMockScenario = (typeof SKILL_PRESETS_MOCK_SCENARIOS)[number]

/** Scenarios played as an organization member without admin rights. */
export const SKILL_PRESETS_MOCK_MEMBER_SCENARIOS: readonly SkillPresetsMockScenario[] = ['member', 'member-no-preset']

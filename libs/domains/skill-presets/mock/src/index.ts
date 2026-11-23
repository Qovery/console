export * from './lib/skill-presets-mock-mode'
export * from './lib/skill-presets-mock-adapter'
export { SKILL_PRESETS_MOCK_SCENARIOS, type SkillPresetsMockScenario } from './lib/mock-scenario-names'
export type { SkillPresetsMockService } from './lib/skill-presets-mock-server'

/** Descriptions and the unsafe sample of the mock scenarios, loaded only when the mock is active. */
export const loadSkillPresetsMockTools = () => import('./lib/mock-tools')

import { SKILL_PRESETS_MOCK } from '@qovery/shared/util-node-env'
import { SKILL_PRESETS_MOCK_SCENARIOS, type SkillPresetsMockScenario } from './mock/mock-scenario-names'

export const SKILL_PRESETS_MOCK_QUERY_PARAM = 'mockSkillPresets'
const STORAGE_KEY = 'qovery-mock-skill-presets'

const isScenario = (value?: string | null): value is SkillPresetsMockScenario =>
  SKILL_PRESETS_MOCK_SCENARIOS.includes(value as SkillPresetsMockScenario)

const readQueryParam = () => {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(SKILL_PRESETS_MOCK_QUERY_PARAM)
}

const readStorage = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * The mock data scenario to serve the skill presets endpoints from, or null to call the API.
 *
 * Only a build with `NX_PUBLIC_SKILL_PRESETS_MOCK=true` can serve mock data, for local runs and
 * preview environments. Without it, the URL changes nothing. With it, `?mockSkillPresets=<scenario>`
 * picks the scenario (default `typical`), remembered for the browser tab. Data resets on reload.
 */
export function getSkillPresetsMockScenario(): SkillPresetsMockScenario | null {
  if (SKILL_PRESETS_MOCK?.trim() !== 'true') return null

  const fromUrl = readQueryParam()
  if (fromUrl === 'off') {
    clearSkillPresetsMockScenario()
    return null
  }
  if (isScenario(fromUrl)) {
    persist(fromUrl)
    return fromUrl
  }
  const stored = readStorage()
  if (stored === 'off') return null
  return isScenario(stored) ? stored : 'typical'
}

const persist = (scenario: SkillPresetsMockScenario) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, scenario)
  } catch {
    // Private mode: the query parameter still works for the current page.
  }
}

/** "Use the API" for the rest of the tab, even though the build allows mock data. */
export function clearSkillPresetsMockScenario() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, 'off')
  } catch {
    // Private mode: the query parameter still works for the current page.
  }
}

/** Switches scenario and reloads, so the in-memory data starts from the new scenario's seed. */
export function switchSkillPresetsMockScenario(scenario: SkillPresetsMockScenario | 'off') {
  const url = new URL(window.location.href)
  url.searchParams.set(SKILL_PRESETS_MOCK_QUERY_PARAM, scenario)
  window.location.assign(url.toString())
}

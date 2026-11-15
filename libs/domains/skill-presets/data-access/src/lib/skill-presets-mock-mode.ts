import { SKILL_PRESETS_MOCK } from '@qovery/shared/util-node-env'
import {
  SKILL_PRESETS_MOCK_MEMBER_SCENARIOS,
  SKILL_PRESETS_MOCK_SCENARIOS,
  type SkillPresetsMockScenario,
} from './mock/mock-scenario-names'

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

const isMockBuild = () => SKILL_PRESETS_MOCK?.trim() === 'true'

const write = (value: string) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Private mode: the query parameter still works for the current page.
  }
}

/**
 * Remembers the scenario of the page the tab was opened on, so it survives in-app navigation. Runs
 * once when the module loads, never during render. Switching scenario reloads the page, so this
 * covers every way to pick one.
 */
export function rememberSkillPresetsMockScenario() {
  if (!isMockBuild()) return
  const fromUrl = readQueryParam()
  if (fromUrl === 'off' || isScenario(fromUrl)) write(fromUrl)
}

rememberSkillPresetsMockScenario()

/**
 * The mock data scenario to serve the skill presets endpoints from, or null to call the API.
 *
 * Only a build with `NX_PUBLIC_SKILL_PRESETS_MOCK=true` can serve mock data, for local runs and
 * preview environments. Without it, the URL changes nothing. With it, `?mockSkillPresets=<scenario>`
 * picks the scenario (default `typical`), remembered for the browser tab, and `off` goes back to the
 * API. Data resets on reload. Reads only: safe to call during render.
 */
export function getSkillPresetsMockScenario(): SkillPresetsMockScenario | null {
  if (!isMockBuild()) return null
  const fromUrl = readQueryParam()
  const chosen = fromUrl === 'off' || isScenario(fromUrl) ? fromUrl : readStorage()
  if (chosen === 'off') return null
  return isScenario(chosen) ? chosen : 'typical'
}

/**
 * In mock mode, whether the mock user may manage skill presets: false in the member scenarios. Null
 * outside mock mode, where the user's organization role decides.
 */
export function getSkillPresetsMockCanManage(): boolean | null {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return null
  return !SKILL_PRESETS_MOCK_MEMBER_SCENARIOS.includes(scenario)
}

/**
 * In mock mode, whether the mock organization has AI features on: false in the ai-features-off
 * scenario. Null outside mock mode, where the organization's own setting decides.
 */
export function getSkillPresetsMockAiFeaturesEnabled(): boolean | null {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return null
  return scenario !== 'ai-features-off'
}

/** Switches scenario and reloads, so the in-memory data starts from the new scenario's seed. */
export function switchSkillPresetsMockScenario(scenario: SkillPresetsMockScenario | 'off') {
  const url = new URL(window.location.href)
  url.searchParams.set(SKILL_PRESETS_MOCK_QUERY_PARAM, scenario)
  window.location.assign(url.toString())
}

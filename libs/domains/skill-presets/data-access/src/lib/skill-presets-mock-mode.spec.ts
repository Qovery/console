import type * as MockMode from './skill-presets-mock-mode'

const loadWithFlag = (flag?: string) => {
  let module: typeof MockMode | undefined
  jest.isolateModules(() => {
    jest.doMock('@qovery/shared/util-node-env', () => ({ SKILL_PRESETS_MOCK: flag }))
    module = jest.requireActual<typeof MockMode>('./skill-presets-mock-mode')
  })
  if (!module) throw new Error('module not loaded')
  return module
}

const setSearch = (search: string) => window.history.replaceState({}, '', `/settings${search}`)

describe('getSkillPresetsMockScenario', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setSearch('')
  })

  it('never serves mock data when the build flag is off, whatever the URL says', () => {
    setSearch('?mockSkillPresets=typical')
    expect(loadWithFlag(undefined).getSkillPresetsMockScenario()).toBeNull()
    expect(loadWithFlag('false').getSkillPresetsMockScenario()).toBeNull()
    expect(window.sessionStorage.length).toBe(0)
  })

  it('serves the typical scenario by default when the flag is on', () => {
    expect(loadWithFlag('true').getSkillPresetsMockScenario()).toBe('typical')
  })

  it('remembers the scenario of the page the tab was opened on', () => {
    setSearch('?mockSkillPresets=large')
    const { getSkillPresetsMockScenario } = loadWithFlag('true')
    setSearch('')
    expect(getSkillPresetsMockScenario()).toBe('large')
  })

  it('does not write to storage while rendering', () => {
    const { getSkillPresetsMockScenario } = loadWithFlag('true')
    setSearch('?mockSkillPresets=slow')
    expect(getSkillPresetsMockScenario()).toBe('slow')
    expect(window.sessionStorage.length).toBe(0)
  })

  it('ignores unknown scenarios', () => {
    setSearch('?mockSkillPresets=unknown')
    expect(loadWithFlag('true').getSkillPresetsMockScenario()).toBe('typical')
  })

  it('goes back to the API with ?mockSkillPresets=off, for the rest of the tab', () => {
    setSearch('?mockSkillPresets=off')
    const { getSkillPresetsMockScenario } = loadWithFlag('true')
    setSearch('')
    expect(getSkillPresetsMockScenario()).toBeNull()
  })
})

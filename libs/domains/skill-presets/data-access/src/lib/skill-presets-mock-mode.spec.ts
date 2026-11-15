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
  })

  it('serves the typical scenario by default when the flag is on', () => {
    expect(loadWithFlag('true').getSkillPresetsMockScenario()).toBe('typical')
  })

  it('picks the scenario from the URL and remembers it for the tab', () => {
    const { getSkillPresetsMockScenario } = loadWithFlag('true')
    setSearch('?mockSkillPresets=large')
    expect(getSkillPresetsMockScenario()).toBe('large')
    setSearch('')
    expect(getSkillPresetsMockScenario()).toBe('large')
  })

  it('ignores unknown scenarios', () => {
    setSearch('?mockSkillPresets=unknown')
    expect(loadWithFlag('true').getSkillPresetsMockScenario()).toBe('typical')
  })

  it('goes back to the API with ?mockSkillPresets=off, for the rest of the tab', () => {
    const { getSkillPresetsMockScenario } = loadWithFlag('true')
    setSearch('?mockSkillPresets=off')
    expect(getSkillPresetsMockScenario()).toBeNull()
    setSearch('')
    expect(getSkillPresetsMockScenario()).toBeNull()
  })
})

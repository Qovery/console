import {
  getSkillPresetFindings,
  resetSkillPresetsMockApi,
  skillPresetsApi,
} from '@qovery/domains/skill-presets/data-access'
import { SKILL_PRESET_TEMPLATES } from './skill-preset-templates'

jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))

describe('SKILL_PRESET_TEMPLATES', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('qovery-mock-skill-presets', 'empty')
    resetSkillPresetsMockApi()
  })
  afterEach(() => {
    window.sessionStorage.clear()
    resetSkillPresetsMockApi()
  })

  it('covers the seven profiles', () => {
    expect(SKILL_PRESET_TEMPLATES.map(({ id }) => id)).toEqual([
      'developer',
      'product-manager',
      'platform-engineer',
      'engineering-manager',
      'data-ml-engineer',
      'security',
      'qa-tester',
    ])
  })

  it.each(SKILL_PRESET_TEMPLATES.map((template) => [template.title, template] as const))(
    '%s passes validation and the content checks',
    async (_, template) => {
      const save = skillPresetsApi.createSkillPreset('organization-1', {
        ...template.preset,
        assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
      })
      await expect(save.catch((error) => getSkillPresetFindings(error))).resolves.toEqual(
        expect.objectContaining({ name: template.preset.name })
      )
    }
  )
})

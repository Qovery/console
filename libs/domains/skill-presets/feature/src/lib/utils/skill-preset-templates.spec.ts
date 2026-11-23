import axios from 'axios'
import { getSkillPresetFindings, skillPresetsApi } from '@qovery/domains/skill-presets/data-access'
import { installSkillPresetsMock, resetSkillPresetsMock } from '@qovery/domains/skill-presets/mock'
import { SKILL_PRESET_TEMPLATES } from './skill-preset-templates'

jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))

describe('SKILL_PRESET_TEMPLATES', () => {
  let uninstall: () => void
  beforeAll(() => {
    uninstall = installSkillPresetsMock(axios, 'api', { passthrough: false })
  })
  afterAll(() => uninstall())
  beforeEach(() => {
    window.sessionStorage.setItem('qovery-mock-skill-presets', 'empty')
    resetSkillPresetsMock()
  })
  afterEach(() => {
    window.sessionStorage.clear()
    resetSkillPresetsMock()
  })

  it('covers the eight profiles', () => {
    expect(SKILL_PRESET_TEMPLATES.map(({ id }) => id)).toEqual([
      'developer',
      'product-manager',
      'platform-engineer',
      'engineering-manager',
      'data-ml-engineer',
      'security',
      'qa-tester',
      'support-on-call',
    ])
  })

  it.each(SKILL_PRESET_TEMPLATES.map((template) => [template.title, template] as const))(
    '%s passes validation and the content checks',
    async (_, template) => {
      const save = skillPresetsApi.createSkillPreset('organization-1', {
        ...template.preset,
        is_template: false,
        assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
      })
      await expect(save.catch((error) => getSkillPresetFindings(error))).resolves.toEqual(
        expect.objectContaining({ name: template.preset.name })
      )
    }
  )
})

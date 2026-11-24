import axios from 'axios'
import { mutations } from '@qovery/domains/skill-presets/data-access'
import { installSkillPresetsMock, setSkillPresetsMockScenario } from '@qovery/domains/skill-presets/mock'
import { getSkillPresetFindings } from '@qovery/domains/skill-presets/util'
import { SKILL_PRESET_TEMPLATES } from './skill-preset-templates'

describe('SKILL_PRESET_TEMPLATES', () => {
  let uninstall: () => void
  beforeAll(() => {
    uninstall = installSkillPresetsMock(axios, 'api', { passthrough: false })
  })
  afterAll(() => uninstall())
  beforeEach(() => {
    setSkillPresetsMockScenario('empty')
  })
  afterEach(() => {
    window.sessionStorage.clear()
    setSkillPresetsMockScenario()
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
      const save = mutations.createSkillPreset({
        organizationId: 'organization-1',
        body: {
          ...template.preset,
          is_template: false,
          assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
        },
      })
      await expect(save.catch((error) => getSkillPresetFindings(error))).resolves.toEqual(
        expect.objectContaining({ name: template.preset.name })
      )
    }
  )
})

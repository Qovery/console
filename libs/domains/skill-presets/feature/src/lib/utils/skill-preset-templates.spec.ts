import { toSkillPresetFormValues } from './skill-preset-form'
import { SKILL_PRESET_TEMPLATES } from './skill-preset-templates'
import { validateSkillPresetForm } from './skill-preset-validation'

describe('SKILL_PRESET_TEMPLATES', () => {
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
    '%s passes the editor validation',
    (_, { preset }) => {
      const form = toSkillPresetFormValues({
        ...preset,
        assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
      })
      expect(validateSkillPresetForm(form)).toEqual({})
    }
  )
})

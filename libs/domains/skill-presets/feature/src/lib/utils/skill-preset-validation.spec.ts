import { toSkillPresetFormValues } from './skill-preset-form'
import { validateSkillPresetForm } from './skill-preset-validation'

const base = () => ({ ...toSkillPresetFormValues(), name: 'Backend team' })

describe('validateSkillPresetForm', () => {
  it('accepts a minimal preset', () => {
    expect(validateSkillPresetForm(base())).toEqual({})
  })

  it('requires a name within the limit', () => {
    expect(validateSkillPresetForm({ ...base(), name: ' ' })['name']).toBe('Enter a name.')
    expect(validateSkillPresetForm({ ...base(), name: 'a'.repeat(101) })['name']).toBe('At most 100 characters.')
  })

  it('checks custom skill names, descriptions and content', () => {
    const values = {
      ...base(),
      customSkills: [
        { key: '1', skillName: 'qovery-mine', description: 'd', content: 'c' },
        { key: '2', skillName: 'Bad_Name', description: 'd', content: 'c' },
        { key: '3', skillName: 'ok-name', description: '', content: '' },
        { key: '4', skillName: 'ok-name', description: 'd', content: 'c' },
      ],
    }
    const errors = validateSkillPresetForm(values)
    expect(errors['customSkills.0.skillName']).toContain('reserved')
    expect(errors['customSkills.1.skillName']).toContain('lowercase')
    expect(errors['customSkills.2.description']).toContain('agents use it')
    expect(errors['customSkills.2.content']).toBe('Write the skill content.')
    expect(errors['customSkills.3.skillName']).toBe('Another skill in this preset has this name.')
  })

  it('requires content for overlays and a description for replacements', () => {
    const values = base()
    values.qoverySkills[1] = { ...values.qoverySkills[1], choice: 'OVERLAY' }
    values.qoverySkills[2] = { ...values.qoverySkills[2], choice: 'REPLACE', content: 'mine' }
    const errors = validateSkillPresetForm(values)
    expect(errors['qoverySkills.1.content']).toContain('team instructions')
    expect(errors['qoverySkills.2.description']).toContain('agents use it')
  })

  it('caps the team context at 32 KB', () => {
    expect(validateSkillPresetForm({ ...base(), teamContext: 'x'.repeat(32769) })['teamContext']).toBe(
      'At most 32,768 characters.'
    )
  })
})

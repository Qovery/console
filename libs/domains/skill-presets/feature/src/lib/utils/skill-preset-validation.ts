import { SKILL_NAME_PATTERN, SKILL_PRESET_LIMITS } from '@qovery/domains/skill-presets/data-access'
import { type SkillPresetFormValues, effectiveQoverySkills } from './skill-preset-form'

const formatCount = (value: number) => value.toLocaleString('en-US')

export const tooLong = (max: number) => `At most ${formatCount(max)} characters.`

/** Client-side mirror of the q-core limits. Field paths match the form so errors land on the right field. */
export function validateSkillPresetForm(values: SkillPresetFormValues): Record<string, string> {
  const limits = SKILL_PRESET_LIMITS
  const errors: Record<string, string> = {}

  const name = values.name.trim()
  if (!name) errors['name'] = 'Enter a name.'
  else if (name.length > limits.nameMaxLength) errors['name'] = tooLong(limits.nameMaxLength)

  if (values.description.length > limits.descriptionMaxLength) {
    errors['description'] = tooLong(limits.descriptionMaxLength)
  }
  if (values.teamContext.length > limits.teamContextMaxLength) {
    errors['teamContext'] = tooLong(limits.teamContextMaxLength)
  }

  if (values.base === 'QOVERY_FULL') {
    values.qoverySkills.forEach((skill, index) => {
      if (skill.choice === 'AS_IS' || skill.choice === 'DISABLE') return
      const path = `qoverySkills.${index}`
      if (skill.choice === 'REPLACE') {
        if (!skill.description.trim())
          errors[`${path}.description`] = 'Enter a description: agents use it to decide when to load the skill.'
        else if (skill.description.length > limits.descriptionMaxLength)
          errors[`${path}.description`] = tooLong(limits.descriptionMaxLength)
      }
      if (!skill.content.trim()) {
        errors[`${path}.content`] =
          skill.choice === 'OVERLAY'
            ? 'Write the team instructions, or use the skill as is.'
            : 'Write the replacement content.'
      } else if (skill.content.length > limits.skillContentMaxLength) {
        errors[`${path}.content`] = tooLong(limits.skillContentMaxLength)
      }
    })
  }

  const seenNames = new Set<string>()
  values.customSkills.forEach((skill, index) => {
    const path = `customSkills.${index}`
    const skillName = skill.skillName.trim()
    if (!skillName) errors[`${path}.skillName`] = 'Enter a skill name.'
    else if (skillName.startsWith('qovery'))
      errors[`${path}.skillName`] = 'Names starting with "qovery" are reserved for Qovery skills.'
    else if (!SKILL_NAME_PATTERN.test(skillName)) {
      errors[`${path}.skillName`] =
        'Use lowercase letters, digits and hyphens, at most 64 characters, no hyphen at the start or end.'
    } else if (seenNames.has(skillName)) errors[`${path}.skillName`] = 'Another skill in this preset has this name.'
    seenNames.add(skillName)

    if (!skill.description.trim())
      errors[`${path}.description`] = 'Enter a description: agents use it to decide when to load the skill.'
    else if (skill.description.length > limits.descriptionMaxLength)
      errors[`${path}.description`] = tooLong(limits.descriptionMaxLength)

    if (!skill.content.trim()) errors[`${path}.content`] = 'Write the skill content.'
    else if (skill.content.length > limits.skillContentMaxLength)
      errors[`${path}.content`] = tooLong(limits.skillContentMaxLength)
  })

  const skillCount = effectiveQoverySkills(values).length + values.customSkills.length
  if (skillCount > limits.maxSkills) {
    errors['customSkills'] = `A preset holds at most ${limits.maxSkills} skill changes. This one has ${skillCount}.`
  }

  return errors
}

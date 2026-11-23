import { type FieldErrors, type Resolver } from 'react-hook-form'
import {
  SKILL_NAME_PATTERN,
  SKILL_PRESET_LIMITS,
  isQoverySkillName,
  totalPresetTextLength,
} from '@qovery/domains/skill-presets/data-access'
import { type SkillPresetFormValues, effectiveQoverySkills, toSkillPresetRequest } from './skill-preset-form'

const formatCount = (value: number) => value.toLocaleString('en-US')

export const tooLong = (max: number) => `At most ${formatCount(max)} characters.`

/** Error map shape react-hook-form expects, built from the flat `path: message` map below. */
export function toFieldErrors(flat: Record<string, string>): FieldErrors<SkillPresetFormValues> {
  const nested: Record<string, unknown> = {}
  Object.entries(flat).forEach(([path, message]) => {
    const keys = path.split('.')
    let node = nested
    keys.slice(0, -1).forEach((key) => {
      node[key] = (node[key] as Record<string, unknown> | undefined) ?? {}
      node = node[key] as Record<string, unknown>
    })
    node[keys[keys.length - 1]] = { type: 'validate', message }
  })
  return nested as FieldErrors<SkillPresetFormValues>
}

/** The reverse, for sections that look errors up by path. */
export function flattenFieldErrors(errors: object, prefix = ''): Record<string, string> {
  const flat: Record<string, string> = {}
  Object.entries(errors).forEach(([key, value]) => {
    if (!value || typeof value !== 'object' || key === 'ref') return
    const path = prefix ? `${prefix}.${key}` : key
    if ('message' in value && typeof value.message === 'string') flat[path] = value.message
    else Object.assign(flat, flattenFieldErrors(value, path))
  })
  return flat
}

/** Runs the client-side checks through react-hook-form, so errors live in its form state. */
export const skillPresetResolver: Resolver<SkillPresetFormValues> = (values) => {
  const errors = validateSkillPresetForm(values)
  return Object.keys(errors).length > 0 ? { values: {}, errors: toFieldErrors(errors) } : { values, errors: {} }
}

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

  if (values.base === 'FULL') {
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
    else if (isQoverySkillName(skillName))
      errors[`${path}.skillName`] =
        'The name "qovery" and names starting with "qovery-" are reserved for Qovery skills.'
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

  const totalText = totalPresetTextLength(toSkillPresetRequest(values))
  if (totalText > limits.totalTextMaxLength) {
    // Not under `root`: react-hook-form ignores root errors when it decides whether a submit is valid.
    errors['totalText'] =
      `This preset holds ${formatCount(totalText)} characters of text, over the ${formatCount(limits.totalTextMaxLength)} a model can review. Shorten the team context or your skills.`
  }

  const skillCount = effectiveQoverySkills(values).length + values.customSkills.length
  if (skillCount > limits.maxSkills) {
    errors['customSkills.root'] =
      `A preset holds at most ${limits.maxSkills} skill changes. This one has ${skillCount}.`
  }

  const assignmentCount = values.roleIds.length + values.userIds.length
  if (assignmentCount > limits.maxAssignments) {
    errors['userIds'] =
      `A preset holds at most ${limits.maxAssignments} roles and members. This one has ${assignmentCount}: assign a role rather than each member.`
  }
  return errors
}

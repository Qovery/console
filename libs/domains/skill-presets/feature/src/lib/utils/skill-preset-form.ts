import equal from 'fast-deep-equal'
import {
  type SkillPresetBase,
  type SkillPresetRequest,
  type SkillPresetResponse,
  type SkillPresetSkillRequest,
} from 'qovery-typescript-axios'
import { isQoverySkillName } from '@qovery/domains/skill-presets/util'
import { QOVERY_SKILLS } from './qovery-skills'

/** AS_IS means the preset has no entry for the skill: agents load it as Qovery publishes it. */
export type QoverySkillChoice = 'AS_IS' | 'OVERLAY' | 'REPLACE' | 'DISABLE'

export interface QoverySkillFormValue {
  skillName: string
  choice: QoverySkillChoice
  description: string
  content: string
}

export interface CustomSkillFormValue {
  skillName: string
  description: string
  content: string
}

export interface SkillPresetFormValues {
  name: string
  isTemplate: boolean
  description: string
  base: SkillPresetBase
  teamContext: string
  qoverySkills: QoverySkillFormValue[]
  customSkills: CustomSkillFormValue[]
  organizationDefault: boolean
  roleIds: string[]
  userIds: string[]
}

type PresetLike = Pick<
  SkillPresetResponse,
  'name' | 'description' | 'base' | 'team_context' | 'skills' | 'assigned_to'
> & {
  is_template?: boolean
}

export function toSkillPresetFormValues(preset?: PresetLike): SkillPresetFormValues {
  const skills = preset?.skills ?? []
  const entryOf = (skillName: string) => skills.find((skill) => skill.skill_name === skillName)
  const knownNames = QOVERY_SKILLS.map(({ name }) => name)
  // Keep Qovery skills the catalog does not know yet, so saving never drops them.
  const extraQoveryNames = skills
    .filter((skill) => skill.mode !== 'ADD' && isQoverySkillName(skill.skill_name))
    .map((skill) => skill.skill_name)
    .filter((name) => !knownNames.includes(name))

  return {
    name: preset?.name ?? '',
    isTemplate: Boolean(preset?.is_template),
    description: preset?.description ?? '',
    base: preset?.base ?? 'FULL',
    teamContext: preset?.team_context ?? '',
    qoverySkills: [...knownNames, ...extraQoveryNames].map((skillName) => {
      const entry = entryOf(skillName)
      return {
        skillName,
        choice: entry && entry.mode !== 'ADD' ? entry.mode : 'AS_IS',
        description: entry?.description ?? '',
        content: entry?.content ?? '',
      }
    }),
    customSkills: skills
      .filter((skill) => skill.mode === 'ADD')
      .map((skill) => ({
        skillName: skill.skill_name,
        description: skill.description ?? '',
        content: skill.content ?? '',
      })),
    organizationDefault: preset?.assigned_to.organization_default ?? false,
    roleIds: preset?.assigned_to.role_ids ?? [],
    userIds: preset?.assigned_to.user_ids ?? [],
  }
}

/** Qovery skill entries only apply to the Full base. On other bases they stay in the draft but are not sent. */
export const effectiveQoverySkills = (values: Pick<SkillPresetFormValues, 'base' | 'qoverySkills'>) =>
  values.base === 'FULL' ? values.qoverySkills.filter(({ choice }) => choice !== 'AS_IS') : []

/**
 * The request q-core accepts. DISABLE carries no content or description and OVERLAY no description
 * (q-core answers 400 otherwise), even when the draft still holds text from another mode. A template
 * is never assigned.
 */
export function toSkillPresetRequest(values: SkillPresetFormValues) {
  const qoverySkills: SkillPresetSkillRequest[] = effectiveQoverySkills(values).map(
    ({ skillName, choice, description, content }) => {
      if (choice === 'DISABLE') return { skill_name: skillName, mode: 'DISABLE' }
      if (choice === 'OVERLAY') return { skill_name: skillName, mode: 'OVERLAY', content }
      return { skill_name: skillName, mode: 'REPLACE', description, content }
    }
  )
  const customSkills: SkillPresetSkillRequest[] = values.customSkills.map(({ skillName, description, content }) => ({
    skill_name: skillName.trim(),
    mode: 'ADD',
    description,
    content,
  }))

  return {
    name: values.name.trim(),
    is_template: values.isTemplate,
    description: values.description,
    base: values.base,
    team_context: values.teamContext.trim() ? values.teamContext : null,
    skills: [...qoverySkills, ...customSkills],
    assigned_to: values.isTemplate
      ? { organization_default: false, role_ids: [], user_ids: [] }
      : { organization_default: values.organizationDefault, role_ids: values.roleIds, user_ids: values.userIds },
  } satisfies SkillPresetRequest
}

/**
 * A copy that later edits cannot change. react-hook-form hands the submit handler its live values,
 * which keep changing while the save runs.
 */
export const snapshotSkillPresetFormValues = (values: SkillPresetFormValues): SkillPresetFormValues => ({
  ...values,
  qoverySkills: values.qoverySkills.map((skill) => ({ ...skill })),
  customSkills: values.customSkills.map((skill) => ({ ...skill })),
  roleIds: [...values.roleIds],
  userIds: [...values.userIds],
})

/**
 * The draft to show once a save succeeds: the saved revision, plus every field the admin changed while
 * the save was running. Fields left alone since the submit take the saved value.
 */
export function keepEditsSinceSubmit({
  saved,
  submitted,
  current,
}: {
  saved: SkillPresetFormValues
  submitted: SkillPresetFormValues
  current: SkillPresetFormValues
}): SkillPresetFormValues {
  const keys = Object.keys(saved) as (keyof SkillPresetFormValues)[]
  return keys.reduce(
    (values, key) => (equal(current[key], submitted[key]) ? values : { ...values, [key]: current[key] }),
    saved
  )
}

import {
  type SkillPresetBase,
  type SkillPresetRequest,
  type SkillPresetResponse,
  type SkillPresetSkill,
  isQoverySkillName,
} from '@qovery/domains/skill-presets/data-access'
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
  /** Stable key for the list: the name is editable. */
  key: string
  skillName: string
  description: string
  content: string
}

export interface SkillPresetFormValues {
  name: string
  description: string
  base: SkillPresetBase
  teamContext: string
  qoverySkills: QoverySkillFormValue[]
  customSkills: CustomSkillFormValue[]
  organizationDefault: boolean
  roleIds: string[]
  userIds: string[]
}

type PresetLike = Pick<SkillPresetResponse, 'name' | 'description' | 'base' | 'team_context' | 'skills' | 'assigned_to'>

let customSkillKey = 0
export const newCustomSkillKey = () => `custom-skill-${++customSkillKey}`

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
    description: preset?.description ?? '',
    base: preset?.base ?? 'QOVERY_FULL',
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
        key: newCustomSkillKey(),
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
  values.base === 'QOVERY_FULL' ? values.qoverySkills.filter(({ choice }) => choice !== 'AS_IS') : []

export function toSkillPresetRequest(values: SkillPresetFormValues): SkillPresetRequest {
  const qoverySkills: SkillPresetSkill[] = effectiveQoverySkills(values).map(
    ({ skillName, choice, description, content }) => {
      if (choice === 'DISABLE') return { skill_name: skillName, mode: 'DISABLE' }
      if (choice === 'OVERLAY') return { skill_name: skillName, mode: 'OVERLAY', content }
      return { skill_name: skillName, mode: 'REPLACE', description, content }
    }
  )
  const customSkills: SkillPresetSkill[] = values.customSkills.map(({ skillName, description, content }) => ({
    skill_name: skillName.trim(),
    mode: 'ADD',
    description,
    content,
  }))

  return {
    name: values.name.trim(),
    description: values.description,
    base: values.base,
    team_context: values.teamContext.trim() ? values.teamContext : null,
    skills: [...qoverySkills, ...customSkills],
    assigned_to: {
      organization_default: values.organizationDefault,
      role_ids: values.roleIds,
      user_ids: values.userIds,
    },
  }
}

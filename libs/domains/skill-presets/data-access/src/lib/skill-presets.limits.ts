/** Mirrors `SkillPresetDomain` in q-core. The API stays the authority: these only give earlier feedback. */
export const SKILL_PRESET_LIMITS = {
  nameMaxLength: 100,
  descriptionMaxLength: 1024,
  teamContextMaxLength: 32768,
  skillContentMaxLength: 65536,
  maxSkills: 50,
  /** Roles and members together: past that, assign a role rather than each member. */
  maxAssignments: 200,
  skillNameMaxLength: 64,
  /** All the text of a preset together (description, team context, skill descriptions and content), so a model can review it. */
  totalTextMaxLength: 200000,
} as const

/** The text q-core counts against `totalTextMaxLength`: everything the review reads. */
export function totalPresetTextLength(preset: {
  description?: string | null
  team_context?: string | null
  skills: { description?: string | null; content?: string | null }[]
}) {
  return (
    (preset.description?.length ?? 0) +
    (preset.team_context?.length ?? 0) +
    preset.skills.reduce((sum, skill) => sum + (skill.description?.length ?? 0) + (skill.content?.length ?? 0), 0)
  )
}

/** Agent Skills naming rule: lowercase letters, digits and hyphens, at most 64 characters. */
export const SKILL_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/

export const isQoverySkillName = (skillName: string) => skillName === 'qovery' || skillName.startsWith('qovery-')

/** About 4 characters per token for English markdown, as q-core computes it. An estimate, not a bill. */
export const approxTokens = (text?: string | null) => (text ? Math.floor((text.length + 3) / 4) : 0)

/**
 * q-core refuses the Owner role as a target (400): the organization owner is resolved as an admin, so a
 * preset assigned to Owner would never apply. Default role names are fixed.
 */
export const isOwnerRole = (role: { name: string }) => role.name.toLowerCase() === 'owner'

/** Range and limits of the endpoints: 30 days by default, 90 at most. Anything else is a 400. */
export const AGENT_ACTIVITY_LIMITS = {
  defaultRangeDays: 30,
  maxRangeDays: 90,
  maxRecent: 100,
  maxMembers: 500,
  maxPolicyTokens: 100,
  maxSkills: 100,
  maxTopSkills: 3,
  skillNamePattern: /^[a-z0-9._-]{1,64}$/,
} as const

/** Mirrors `SkillPresetDomain` in q-core. The API stays the authority: these only give earlier feedback. */
export const SKILL_PRESET_LIMITS = {
  nameMaxLength: 100,
  descriptionMaxLength: 1024,
  teamContextMaxLength: 32768,
  skillContentMaxLength: 65536,
  maxSkills: 50,
  skillNameMaxLength: 64,
} as const

/** Agent Skills naming rule: lowercase letters, digits and hyphens, at most 64 characters. */
export const SKILL_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/

export const isQoverySkillName = (skillName: string) => skillName === 'qovery' || skillName.startsWith('qovery-')

/** About 4 characters per token for English markdown, as q-core computes it. An estimate, not a bill. */
export const approxTokens = (text?: string | null) => (text ? Math.floor((text.length + 3) / 4) : 0)

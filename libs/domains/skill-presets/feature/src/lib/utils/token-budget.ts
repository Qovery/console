import { type SkillPresetBase, type SkillPresetSkill, approxTokens } from '@qovery/domains/skill-presets/data-access'
import { QOVERY_SKILLS } from './qovery-skills'

/**
 * Approximate size of each published Qovery skill, in tokens (characters / 4), measured on
 * qovery-skills a56ca29: its SKILL.md, its description, and its reference files, which the agent
 * reads only when a step needs them. Update them when qovery-skills changes a lot.
 */
export const QOVERY_SKILL_SIZES: Record<string, { skillMd: number; description: number; references: number }> = {
  qovery: { skillMd: 3921, description: 80, references: 2650 },
  'qovery-assess': { skillMd: 7465, description: 230, references: 73422 },
  'qovery-deploy': { skillMd: 4221, description: 142, references: 36531 },
  'qovery-onboard': { skillMd: 2454, description: 130, references: 13740 },
  'qovery-optimize': { skillMd: 2710, description: 179, references: 12306 },
  'qovery-policy-token': { skillMd: 4016, description: 117, references: 10603 },
  'qovery-preview': { skillMd: 2247, description: 92, references: 10605 },
  'qovery-signup': { skillMd: 3553, description: 177, references: 7886 },
  'qovery-speedup': { skillMd: 2209, description: 140, references: 11561 },
  'qovery-terraform': { skillMd: 2426, description: 94, references: 9537 },
  'qovery-troubleshoot': { skillMd: 2927, description: 112, references: 16798 },
}

/** The single loader skill that sits in the agent's skill list once presets ship. */
export const LOADER_SKILL_TOKENS = 1000
/** One manifest line costs about this much before its description. */
export const MANIFEST_TOKENS_PER_SKILL = 40
/** Estimate until the lean skill is written in qovery-skills. */
export const LEAN_SKILL_TOKENS = 600

/** Today, with no preset: every Qovery skill description sits in the agent's context all the time. */
export const TODAY_ALWAYS_TOKENS = Object.values(QOVERY_SKILL_SIZES).reduce((sum, size) => sum + size.description, 0)

export interface PresetLikeForBudget {
  base: SkillPresetBase
  team_context?: string | null
  skills: SkillPresetSkill[]
}

export interface OnDemandBudgetRow {
  skillName: string
  /** Qovery's SKILL.md, or the lean skill, when it is loaded. */
  qoveryTokens: number
  organizationTokens: number
  teamContextTokens: number
  total: number
  /** The same task today, with no preset: the published SKILL.md only. */
  todayTokens: number | null
}

export interface TokenBudget {
  alwaysInContext: { loader: number; manifest: number; total: number }
  todayAlwaysInContext: number
  onDemand: OnDemandBudgetRow[]
  disabled: string[]
}

/**
 * Estimated context cost of a preset for one member. Estimates only: characters / 4, and published
 * Qovery sizes measured on one version of qovery-skills.
 */
export function computeTokenBudget(preset: PresetLikeForBudget | null): TokenBudget {
  const teamContextTokens = approxTokens(preset?.team_context)
  const skills = preset?.skills ?? []
  const manifest = skills.reduce(
    (sum, skill) => sum + MANIFEST_TOKENS_PER_SKILL + approxTokens(skill.description),
    preset ? MANIFEST_TOKENS_PER_SKILL : 0
  )
  const entryOf = (skillName: string) => skills.find((skill) => skill.skill_name === skillName)
  const onDemand: OnDemandBudgetRow[] = []
  const disabled: string[] = []

  const base = preset?.base ?? 'QOVERY_FULL'
  if (base === 'QOVERY_FULL') {
    for (const { name } of QOVERY_SKILLS) {
      const entry = entryOf(name)
      if (entry?.mode === 'DISABLE') {
        disabled.push(name)
        continue
      }
      const qoveryTokens = entry?.mode === 'REPLACE' ? 0 : QOVERY_SKILL_SIZES[name]?.skillMd ?? 0
      const organizationTokens = approxTokens(entry?.content)
      onDemand.push({
        skillName: name,
        qoveryTokens,
        organizationTokens,
        teamContextTokens,
        total: qoveryTokens + organizationTokens + teamContextTokens,
        todayTokens: QOVERY_SKILL_SIZES[name]?.skillMd ?? null,
      })
    }
  } else if (base === 'QOVERY_LEAN') {
    onDemand.push({
      skillName: 'qovery',
      qoveryTokens: LEAN_SKILL_TOKENS,
      organizationTokens: 0,
      teamContextTokens,
      total: LEAN_SKILL_TOKENS + teamContextTokens,
      todayTokens: null,
    })
  }

  for (const skill of skills.filter(({ mode }) => mode === 'ADD')) {
    const organizationTokens = approxTokens(skill.content)
    onDemand.push({
      skillName: skill.skill_name,
      qoveryTokens: 0,
      organizationTokens,
      teamContextTokens,
      total: organizationTokens + teamContextTokens,
      todayTokens: null,
    })
  }

  const loader = preset ? LOADER_SKILL_TOKENS : 0
  return {
    alwaysInContext: { loader, manifest, total: preset ? loader + manifest : TODAY_ALWAYS_TOKENS },
    todayAlwaysInContext: TODAY_ALWAYS_TOKENS,
    onDemand,
    disabled,
  }
}

export const formatTokens = (tokens: number) => `~${Math.round(tokens).toLocaleString('en-US')}`

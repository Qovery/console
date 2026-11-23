import {
  type SkillPresetBase,
  type SkillPresetManifestResponse,
  type SkillPresetSkill,
  approxTokens,
} from '@qovery/domains/skill-presets/data-access'
import { QOVERY_SKILLS } from './qovery-skills'

/**
 * Approximate size of each published Qovery skill, in tokens (characters / 4), measured on
 * qovery-skills a56ca29 (qovery-support on 6717f3d): its SKILL.md, its description, and its reference
 * files, which the agent reads only when a step needs them. Update them when qovery-skills changes a lot.
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
  'qovery-support': { skillMd: 3197, description: 196, references: 22279 },
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

/** Sizes only: what both a draft (from its text) and a resolved manifest (from its counts) can give. */
interface BudgetInput {
  base: SkillPresetBase
  teamContextTokens: number
  skills: { skillName: string; mode: SkillPresetSkill['mode']; descriptionTokens: number; contentTokens: number }[]
}

function budgetOf(input: BudgetInput | null): TokenBudget {
  const teamContextTokens = input?.teamContextTokens ?? 0
  const skills = input?.skills ?? []
  const manifest = skills.reduce(
    (sum, skill) => sum + MANIFEST_TOKENS_PER_SKILL + skill.descriptionTokens,
    input ? MANIFEST_TOKENS_PER_SKILL : 0
  )
  const entryOf = (skillName: string) => skills.find((skill) => skill.skillName === skillName)
  const onDemand: OnDemandBudgetRow[] = []
  const disabled: string[] = []

  const base = input?.base ?? 'FULL'
  if (base === 'FULL') {
    for (const { name } of QOVERY_SKILLS) {
      const entry = entryOf(name)
      if (entry?.mode === 'DISABLE') {
        disabled.push(name)
        continue
      }
      const qoveryTokens = entry?.mode === 'REPLACE' ? 0 : QOVERY_SKILL_SIZES[name]?.skillMd ?? 0
      const organizationTokens = entry?.contentTokens ?? 0
      onDemand.push({
        skillName: name,
        qoveryTokens,
        organizationTokens,
        teamContextTokens,
        total: qoveryTokens + organizationTokens + teamContextTokens,
        todayTokens: QOVERY_SKILL_SIZES[name]?.skillMd ?? null,
      })
    }
    // Qovery skills published after this catalog: their published size is unknown here, the preset's text is not.
    const known = new Set(QOVERY_SKILLS.map(({ name }) => name))
    for (const entry of skills.filter(({ mode, skillName }) => mode !== 'ADD' && !known.has(skillName))) {
      if (entry.mode === 'DISABLE') {
        disabled.push(entry.skillName)
        continue
      }
      onDemand.push({
        skillName: entry.skillName,
        qoveryTokens: 0,
        organizationTokens: entry.contentTokens,
        teamContextTokens,
        total: entry.contentTokens + teamContextTokens,
        todayTokens: null,
      })
    }
  } else if (base === 'LEAN') {
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
    onDemand.push({
      skillName: skill.skillName,
      qoveryTokens: 0,
      organizationTokens: skill.contentTokens,
      teamContextTokens,
      total: skill.contentTokens + teamContextTokens,
      todayTokens: null,
    })
  }

  const loader = input ? LOADER_SKILL_TOKENS : 0
  return {
    alwaysInContext: { loader, manifest, total: input ? loader + manifest : TODAY_ALWAYS_TOKENS },
    todayAlwaysInContext: TODAY_ALWAYS_TOKENS,
    onDemand,
    disabled,
  }
}

/**
 * Estimated context cost of a preset for one member. Estimates only: characters / 4, and published
 * Qovery sizes measured on one version of qovery-skills.
 */
export function computeTokenBudget(preset: PresetLikeForBudget | null): TokenBudget {
  return budgetOf(
    preset && {
      base: preset.base,
      teamContextTokens: approxTokens(preset.team_context),
      skills: preset.skills.map((skill) => ({
        skillName: skill.skill_name,
        mode: skill.mode,
        descriptionTokens: approxTokens(skill.description),
        contentTokens: approxTokens(skill.content),
      })),
    }
  )
}

/** Same estimate from the resolved manifest a member's agent reads: it carries sizes, not text. */
export function computeTokenBudgetFromManifest(manifest: SkillPresetManifestResponse): TokenBudget {
  const preset = manifest.skill_preset
  return budgetOf(
    preset && {
      base: preset.base,
      teamContextTokens: preset.team_context?.approx_tokens ?? 0,
      skills: preset.skills.map((skill) => ({
        skillName: skill.skill_name,
        mode: skill.mode,
        descriptionTokens: approxTokens(skill.description),
        contentTokens: skill.content?.approx_tokens ?? 0,
      })),
    }
  )
}

export const formatTokens = (tokens: number) => `~${Math.round(tokens).toLocaleString('en-US')}`

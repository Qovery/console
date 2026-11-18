/**
 * Types of the skill presets endpoints, mirroring the q-core DTOs (JSON in snake_case).
 *
 * TODO: replace with the types of `qovery-typescript-axios` once the skill presets endpoints are
 * released in qovery-openapi-spec. Keep the names aligned so the swap stays a search and replace.
 */

export type SkillPresetBase = 'QOVERY_FULL' | 'QOVERY_LEAN' | 'NONE'

export type SkillPresetSkillMode = 'DISABLE' | 'OVERLAY' | 'REPLACE' | 'ADD'

export type SkillPresetResolutionSource = 'USER' | 'ROLE' | 'ORGANIZATION' | 'QOVERY_DEFAULT'

export type SkillPresetChangeType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface SkillPresetAssignedTo {
  organization_default: boolean
  role_ids: string[]
  user_ids: string[]
}

export interface SkillPresetSkill {
  skill_name: string
  mode: SkillPresetSkillMode
  description?: string | null
  content?: string | null
}

export interface SkillPresetRequest {
  name: string
  /** A starting point admins copy. Never assigned: q-core answers 400 for an assigned template. */
  is_template: boolean
  description: string
  base: SkillPresetBase
  team_context?: string | null
  skills: SkillPresetSkill[]
  assigned_to: SkillPresetAssignedTo
}

export interface SkillPresetResponse {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string
  base: SkillPresetBase
  team_context: string | null
  skills: SkillPresetSkill[]
  revision: number
  is_template: boolean
  creator_name: string | null
  assigned_to: SkillPresetAssignedTo
}

export type SkillPresetReviewVerdict = 'ALLOW' | 'BLOCK'

/** The model review a saved state passed. */
export interface SkillPresetSecurityReview {
  verdict: SkillPresetReviewVerdict
  /** The model id, for example a Bedrock inference profile. Shown in a tooltip only. */
  model: string
  prompt_version: string
  /** Notes the model raised without blocking. Usually empty. */
  findings: SkillPresetFinding[]
}

export interface SkillPresetRevisionResponse {
  skill_preset_id: string
  /** Null on DELETE revisions, when the review is off, and on revisions saved before it existed. */
  security_review?: SkillPresetSecurityReview | null
  revision: number
  change_type: SkillPresetChangeType
  edited_by: string
  edited_at: string
  name: string
  is_template: boolean
  description: string
  base: SkillPresetBase
  team_context: string | null
  skills: SkillPresetSkill[]
  assigned_to: SkillPresetAssignedTo
}

export interface InjectedContentSummary {
  approx_tokens: number
  sha256: string
}

export interface SkillPresetManifestSkill {
  skill_name: string
  mode: SkillPresetSkillMode
  description: string | null
  content: InjectedContentSummary | null
}

export interface SkillPresetManifestResponse {
  source: SkillPresetResolutionSource
  skill_preset: {
    id: string
    name: string
    base: SkillPresetBase
    revision: number
    updated_at: string
    team_context: InjectedContentSummary | null
    skills: SkillPresetManifestSkill[]
  } | null
}

/**
 * GET /organization/{organizationId}/skillPreset/resolved/skill/{skillName}: what the caller's agent
 * gets for one skill, with the team context. q-core records every call as a LOAD audit entry.
 */
export interface InjectedSkillResponse {
  source: SkillPresetResolutionSource
  skill_name: string
  skill_preset: { id: string; name: string; revision: number } | null
  /** Null when the preset leaves the Qovery skill as published. */
  mode: SkillPresetSkillMode | null
  description: string | null
  content: string | null
  content_sha256: string | null
  team_context: string | null
  team_context_sha256: string | null
}

/** One security finding of a 422. The offending text is never echoed. */
export type SkillPresetFindingSource = 'RULES' | 'MODEL'

/** Model findings use `rule_id` as a category. */
export const SKILL_PRESET_MODEL_CATEGORIES = [
  'prompt-injection',
  'concealment',
  'credential-access',
  'data-exfiltration',
  'unsafe-execution',
  'approval-bypass',
  'social-engineering',
  'other',
] as const

export interface SkillPresetFinding {
  /** RULES: the deterministic checks. MODEL: the review by a model on AWS Bedrock. Absent on older answers: rules. */
  source?: SkillPresetFindingSource
  /** A rule id for RULES, a category for MODEL. */
  rule_id: string
  /** `description`, `team context`, `description of skill '<name>'` or `content of skill '<name>'`. */
  location: string
  /** 1-based, within the field named by `location`. */
  line: number
  reason: string
}

export interface SkillPresetRejection {
  type?: string
  title?: string
  status: 422
  detail: string
  findings: SkillPresetFinding[]
}

/** The `change` of a LOAD audit entry (sub-target SKILL_PRESET). */
export interface SkillLoadChange {
  skill_name: string
  source: SkillPresetResolutionSource
  skill_preset_id: string | null
  skill_preset_name: string | null
  revision: number | null
  mode: SkillPresetSkillMode | null
  content_sha256: string | null
  team_context_sha256: string | null
  from_cache: boolean
}

/** People and roles a preset can be assigned to. */
export interface SkillPresetAssignees {
  roles: { id: string; name: string }[]
  /** `role_id` is the member's role in the organization, used to preview which preset applies to them. */
  members: { id: string; name: string; email: string; role_id?: string }[]
}

export type SkillPresetUsageBucket = 'DAY' | 'HOUR'

export interface SkillPresetUsageParams {
  from: string
  to: string
  bucket: SkillPresetUsageBucket
  skillName?: string
  userSub?: string
  skillPresetId?: string
}

/** GET /organization/{organizationId}/skillPreset/usage. Max range 90 days. */
export interface SkillPresetUsageResponse {
  from: string
  to: string
  bucket: SkillPresetUsageBucket
  totals: {
    loads: number
    cached_loads: number
    members: number
    /** Organization content plus team context, on non-cached loads only. */
    approx_injected_tokens: number
  }
  timeline: { start: string; loads: number; cached_loads: number }[]
  by_skill: { skill_name: string; loads: number; cached_loads: number; members: number; last_loaded_at: string }[]
  by_member: { user_sub: string; user_name: string; loads: number; skills: number; last_loaded_at: string }[]
  /** A null preset groups the loads that had no preset (QOVERY_DEFAULT). */
  by_preset: { skill_preset_id: string | null; skill_preset_name: string | null; loads: number }[]
}

/** Same as the audit log page: the generated client's enums do not list these values yet. */
export const SKILL_PRESET_SUB_TARGET_TYPE = 'SKILL_PRESET'
export const SKILL_LOAD_EVENT_TYPE = 'LOAD'
/** A resolved skill read for display (the Console's member view): audited, not counted in usage. */
export const SKILL_VIEW_EVENT_TYPE = 'VIEW'

/** LOAD: an agent loads the skill (the API default). VIEW: someone reads it, for example in the Console. */
export type ResolvedSkillPurpose = 'LOAD' | 'VIEW'
/** A create or an update the security review refused: nothing was saved. */
export const SKILL_PRESET_REJECTED_EVENT_TYPE = 'REJECTED'

/** The `change` of a REJECTED audit entry: hashes and findings, never the text. */
export interface SkillPresetRejectedChange {
  attempted_change: 'CREATE' | 'UPDATE'
  /** Null on a create. */
  skill_preset_id: string | null
  name: string
  base: SkillPresetBase
  is_template: boolean
  description_sha256: string
  team_context_sha256: string | null
  skills: {
    skill_name: string
    mode: SkillPresetSkillMode
    description_sha256: string | null
    content_sha256: string | null
  }[]
  assigned_to: SkillPresetAssignedTo
  findings: SkillPresetFinding[]
}

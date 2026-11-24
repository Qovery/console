import {
  type SkillPresetAssignedTo,
  type SkillPresetBase,
  type SkillPresetRejectionFinding,
  type SkillPresetResolutionSource,
  type SkillPresetSkillMode,
} from 'qovery-typescript-axios'

export type {
  SkillLoadPurpose as ResolvedSkillPurpose,
  SkillPresetAssignedTo,
  SkillPresetBase,
  SkillPresetChangeType,
  SkillPresetManifestResponse,
  SkillPresetManifestSkill,
  SkillPresetRequest,
  SkillPresetResolvedSkillResponse as InjectedSkillResponse,
  SkillPresetResolutionSource,
  SkillPresetResponse,
  SkillPresetRevisionResponse,
  SkillPresetSkillMode,
  SkillPresetSkillRequest as SkillPresetSkill,
} from 'qovery-typescript-axios'

// Older rule-check responses omit the finding source.
export type SkillPresetFinding = Omit<SkillPresetRejectionFinding, 'source'> &
  Partial<Pick<SkillPresetRejectionFinding, 'source'>>

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

/** The `change` of a SKILL_LOAD or SKILL_VIEW audit entry (sub-target SKILL_PRESET). */
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
  members: { id: string; name: string; email: string; role_id?: string; profile_picture_url?: string }[]
}

/** The `change` of a SKILL_PRESET_REJECTED audit entry: hashes and findings, never the text. */
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

/**
 * One skill in the audit entry of a preset create or update. The text can be left out of the audit log,
 * so its hashes stay: a change of description or content remains visible.
 */
export interface SkillPresetSkillAuditView {
  skill_name: string
  mode: SkillPresetSkillMode
  description: string | null
  description_sha256: string | null
  content: string | null
  content_sha256: string | null
}

import {
  type SkillPresetAssignedTo,
  type SkillPresetRequest,
  type SkillPresetRevisionResponse,
  type SkillPresetSkill,
} from '@qovery/domains/skill-presets/data-access'

export interface SkillChange {
  skillName: string
  before: SkillPresetSkill | null
  after: SkillPresetSkill | null
}

export interface RevisionDiff {
  template: { before: boolean; after: boolean } | null
  name: { before: string; after: string } | null
  description: { before: string; after: string } | null
  base: { before: string; after: string } | null
  teamContext: { before: string; after: string } | null
  skills: SkillChange[]
  assignments: { before: SkillPresetAssignedTo; after: SkillPresetAssignedTo } | null
}

const sameSkill = (a: SkillPresetSkill, b: SkillPresetSkill) =>
  a.mode === b.mode && (a.description ?? '') === (b.description ?? '') && (a.content ?? '') === (b.content ?? '')

const sameAssignment = (a: SkillPresetAssignedTo, b: SkillPresetAssignedTo) =>
  a.organization_default === b.organization_default &&
  [...a.role_ids].sort().join() === [...b.role_ids].sort().join() &&
  [...a.user_ids].sort().join() === [...b.user_ids].sort().join()

const EMPTY_ASSIGNMENT: SkillPresetAssignedTo = { organization_default: false, role_ids: [], user_ids: [] }

/** What [current] changed compared with [previous]. With no previous revision, everything counts as added. */
export function diffRevisions(
  previous: SkillPresetRevisionResponse | undefined,
  current: SkillPresetRevisionResponse
): RevisionDiff {
  const field = (before: string, after: string) => (before === after ? null : { before, after })
  const beforeSkills = new Map((previous?.skills ?? []).map((skill) => [skill.skill_name, skill]))
  const afterSkills = new Map(current.skills.map((skill) => [skill.skill_name, skill]))
  const wasTemplate = previous?.is_template ?? false
  const isTemplate = current.is_template ?? false
  const names = [...new Set([...beforeSkills.keys(), ...afterSkills.keys()])].sort()

  return {
    template: wasTemplate !== isTemplate ? { before: wasTemplate, after: isTemplate } : null,
    name: field(previous?.name ?? '', current.name),
    description: field(previous?.description ?? '', current.description),
    base: previous ? field(previous.base, current.base) : null,
    teamContext: field(previous?.team_context ?? '', current.team_context ?? ''),
    skills: names
      .map((skillName) => ({
        skillName,
        before: beforeSkills.get(skillName) ?? null,
        after: afterSkills.get(skillName) ?? null,
      }))
      .filter(({ before, after }) => !before || !after || !sameSkill(before, after)),
    assignments: sameAssignment(previous?.assigned_to ?? EMPTY_ASSIGNMENT, current.assigned_to)
      ? null
      : { before: previous?.assigned_to ?? EMPTY_ASSIGNMENT, after: current.assigned_to },
  }
}

/** One line per revision, for the timeline: "Team context, qovery-deploy added". */
export function summarizeDiff(diff: RevisionDiff) {
  const parts: string[] = []
  if (diff.template) parts.push(diff.template.after ? 'Made a template' : 'No longer a template')
  if (diff.name) parts.push('Renamed')
  if (diff.base) parts.push('Base changed')
  if (diff.description) parts.push('Description')
  if (diff.teamContext) parts.push('Team context')
  const added = diff.skills.filter(({ before }) => !before).map(({ skillName }) => skillName)
  const removed = diff.skills.filter(({ after }) => !after).map(({ skillName }) => skillName)
  const modified = diff.skills.filter(({ before, after }) => before && after).map(({ skillName }) => skillName)
  if (added.length) parts.push(`${added.join(', ')} added`)
  if (removed.length) parts.push(`${removed.join(', ')} removed`)
  if (modified.length) parts.push(`${modified.join(', ')} changed`)
  if (diff.assignments) parts.push('Assignments')
  return parts.length > 0 ? parts.join(' · ') : 'No content change'
}

export const revisionToRequest = (revision: SkillPresetRevisionResponse): SkillPresetRequest => ({
  name: revision.name,
  is_template: revision.is_template,
  description: revision.description,
  base: revision.base,
  team_context: revision.team_context,
  skills: revision.skills,
  assigned_to: revision.assigned_to,
})

/** Readable text of a skill entry, for the diff viewer. */
export function skillAsText(skill: SkillPresetSkill | null) {
  if (!skill) return ''
  return [
    `mode: ${skill.mode}`,
    skill.description ? `description: ${skill.description}` : null,
    skill.content ? `\n${skill.content}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

/** The friendly name shown for the reviewer: the model id changes with releases, the screen should not. */
export const SECURITY_REVIEW_NAME = 'Model review on AWS Bedrock'

/**
 * "Model review on AWS Bedrock, prompt v1: allowed", with the model id for a tooltip. Null on DELETE
 * revisions, when the review was off, and for revisions saved before it existed.
 */
export function reviewSummary(revision: SkillPresetRevisionResponse) {
  const review = revision.security_review
  if (!review) return null
  const verdict = review.verdict === 'ALLOW' ? 'allowed' : 'blocked'
  return { text: `${SECURITY_REVIEW_NAME}, prompt ${review.prompt_version}: ${verdict}`, model: review.model }
}

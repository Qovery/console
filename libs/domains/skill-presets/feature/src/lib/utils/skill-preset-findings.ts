import { match } from 'ts-pattern'
import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'

/** The editor field a 422 finding points at, from its `location` string. */
export type FindingTarget =
  | { field: 'description' }
  | { field: 'teamContext' }
  | { field: 'skillDescription'; skillName: string }
  | { field: 'skillContent'; skillName: string }

const SKILL_LOCATION = /^(description|content) of skill '(.+)'$/

export function findingTarget(location: string): FindingTarget | null {
  if (location === 'description') return { field: 'description' }
  if (location === 'team context') return { field: 'teamContext' }
  const match = SKILL_LOCATION.exec(location)
  if (!match) return null
  return match[1] === 'description'
    ? { field: 'skillDescription', skillName: match[2] }
    : { field: 'skillContent', skillName: match[2] }
}

export const findingTargetKey = (target: FindingTarget) =>
  'skillName' in target ? `${target.field}:${target.skillName}` : target.field

export function findingsFor(findings: SkillPresetFinding[], target: FindingTarget) {
  const key = findingTargetKey(target)
  return findings
    .filter((finding) => {
      const findingTargetValue = findingTarget(finding.location)
      return findingTargetValue !== null && findingTargetKey(findingTargetValue) === key
    })
    .sort((a, b) => a.line - b.line)
}

/** "team context, line 3" reads better as "Team context, line 3". */
export function findingLocationLabel(finding: SkillPresetFinding) {
  const target = findingTarget(finding.location)
  const where = match(target)
    .with(null, () => finding.location)
    .with({ field: 'description' }, () => 'Preset description')
    .with({ field: 'teamContext' }, () => 'Team context')
    .with({ field: 'skillDescription' }, ({ skillName }) => `${skillName}, description`)
    .with({ field: 'skillContent' }, ({ skillName }) => `${skillName}, content`)
    .exhaustive()
  return `${where}, line ${finding.line}`
}

/** DOM id of the field a finding points at, to move focus there from the summary. */
export function findingFieldId(target: FindingTarget) {
  return `skill-preset-field-${findingTargetKey(target).replace(/[^a-zA-Z0-9-]/g, '-')}`
}

/** Where a finding came from, as text: never shown by color alone. */
export const findingSourceLabel = (finding: SkillPresetFinding) =>
  finding.source === 'MODEL' ? 'Model review' : 'Rule check'

/** One line of text per finding, for fields that only take a text error (inputs, text areas). */
export const findingsAsText = (findings: SkillPresetFinding[]) =>
  findings.length > 0
    ? findings.map((finding) => `${findingSourceLabel(finding)}, line ${finding.line}: ${finding.reason}.`).join(' ')
    : undefined

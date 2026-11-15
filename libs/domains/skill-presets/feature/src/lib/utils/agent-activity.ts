import { type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import { QOVERY_SKILLS } from './qovery-skills'

/**
 * Plain words for a raw audit event on a target, as q-core returns them. Anything not listed shows
 * as "Other (<raw event>)", so a new event type is never hidden or mislabelled.
 */
export function actionLabel(event: string, targetType: string) {
  if (targetType === 'VARIABLE' && ['CREATE', 'UPDATE', 'DELETE'].includes(event)) return 'Variable change'
  switch (event) {
    case 'DEPLOY_QUEUED':
    case 'TRIGGER_DEPLOY':
      return 'Deploy'
    case 'TRIGGER_RESTART':
      return 'Restart'
    case 'TRIGGER_STOP':
      return 'Stop'
    case 'DELETE':
    case 'TRIGGER_DELETE':
      return 'Delete'
    case 'MCP':
      return 'MCP tool call'
    case 'POLICY_FAILED':
    case 'ACCESS_DENIED':
      return 'Denied'
    default:
      return `Other (${event})`
  }
}

const POLICY_TOKEN_ACTOR = /^policy:[^:]*:(.+)$/

/**
 * Who acted. The audit log names a policy token `policy:<id>:<name>`; it has no user sub, so it
 * cannot be filtered on, only shown.
 */
export function actorLabel(userName: string): { kind: 'policy-token' | 'member'; label: string } {
  const policyToken = userName.match(POLICY_TOKEN_ACTOR)
  return policyToken
    ? { kind: 'policy-token', label: `Policy token ${policyToken[1]}` }
    : { kind: 'member', label: userName }
}

const TARGET_LABELS: Record<string, string> = {
  APPLICATION: 'service',
  CONTAINER: 'service',
  JOB: 'job',
  DATABASE: 'database',
  HELM: 'Helm chart',
  TERRAFORM: 'Terraform service',
  ENVIRONMENT: 'environment',
  VARIABLE: 'variable',
  PROJECT: 'project',
}

export const targetLabel = (targetType: string) => TARGET_LABELS[targetType] ?? targetType.toLowerCase()

/** "Deploy (service)", "Variable change", "Other (UPDATE, service)", for the actions by type list. */
export const actionTypeLabel = (event: string, targetType: string) => {
  const action = actionLabel(event, targetType)
  if (action === 'Variable change') return action
  if (action.startsWith('Other (')) return `Other (${event}, ${targetLabel(targetType)})`
  return `${action} (${targetLabel(targetType)})`
}

/**
 * The actions by type list, one row per label: DEPLOY_QUEUED and TRIGGER_DEPLOY on a service are
 * both "Deploy (service)". Most frequent first.
 */
export function groupActionsByType(rows: AgentActivityResponse['actions_by_type']) {
  const grouped = new Map<string, { label: string; count: number; denied: number }>()
  rows.forEach(({ event, target_type, count, denied }) => {
    const label = actionTypeLabel(event, target_type)
    const row = grouped.get(label) ?? { label, count: 0, denied: 0 }
    row.count += count
    row.denied += denied
    grouped.set(label, row)
  })
  return [...grouped.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Qovery skills nobody loaded in the period: candidates to turn off in a preset. */
export function neverLoadedSkills(activity: AgentActivityResponse) {
  const loaded = new Set(activity.by_skill.filter(({ loads }) => loads > 0).map(({ skill_name }) => skill_name))
  return QOVERY_SKILLS.map(({ name }) => name).filter((name) => !loaded.has(name))
}

export type AgentActivityHint =
  | { kind: 'unused-skills'; skills: string[] }
  | { kind: 'environment-denials'; environment: string; count: number }
  /** `userSub` is null for a policy token: it can be named but not drilled into. */
  | { kind: 'member-denials'; userSub: string | null; userName: string; count: number }
  | { kind: 'loads-without-actions'; skillName: string; loads: number }

const REPEATED = 3

/**
 * Factual suggestions computed from the data. No scores and no ranking of people: each hint states
 * what happened and links to the setting that controls it.
 */
export function computeAgentActivityHints(
  activity: AgentActivityResponse,
  { filtered = false }: { filtered?: boolean } = {}
): AgentActivityHint[] {
  if (activity.totals.skill_loads + activity.totals.actions + activity.totals.denials === 0) return []
  const hints: AgentActivityHint[] = []

  // Only meaningful for the whole organization: one member not loading a skill says nothing.
  const unused = filtered ? [] : neverLoadedSkills(activity)
  if (unused.length > 0) hints.push({ kind: 'unused-skills', skills: unused })

  const deniedByEnvironment = new Map<string, number>()
  activity.recent
    .filter(({ outcome, environment_name }) => outcome === 'DENIED' && environment_name)
    .forEach(({ environment_name }) =>
      deniedByEnvironment.set(environment_name ?? '', (deniedByEnvironment.get(environment_name ?? '') ?? 0) + 1)
    )
  ;[...deniedByEnvironment.entries()]
    .filter(([, count]) => count >= REPEATED)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([environment, count]) => hints.push({ kind: 'environment-denials', environment, count }))

  activity.by_member
    // A drill into one member already shows their activity.
    .filter(({ denials }) => !filtered && denials >= REPEATED)
    .forEach(({ user_sub, user_name, denials }) =>
      hints.push({ kind: 'member-denials', userSub: user_sub, userName: user_name, count: denials })
    )

  activity.by_skill
    .filter(({ skill_name, loads, actions }) => skill_name && loads >= 5 && actions === 0)
    .forEach(({ skill_name, loads }) =>
      hints.push({ kind: 'loads-without-actions', skillName: skill_name ?? '', loads })
    )

  return hints
}

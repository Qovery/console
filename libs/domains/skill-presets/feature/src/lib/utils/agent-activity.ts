import { AGENT_ACTIVITY_LIMITS } from '@qovery/domains/skill-presets/data-access'
import {
  type AgentActionOutcome,
  type AgentActivityBucket,
  type AgentActivityResponse,
  type AgentActivitySource,
} from '../agent-activity/agent-activity.types'
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

export const LEGACY_TOKEN_LABEL = 'Unknown policy token (older records)'

/** The people in `by_member`: q-core lists policy tokens there too, marked by `actor_kind`. */
export const peopleRows = (activity: AgentActivityResponse) =>
  activity.by_member.filter(({ actor_kind, user_name }) =>
    actor_kind ? actor_kind === 'MEMBER' : actorLabel(user_name).kind === 'member'
  )

/**
 * Members using agents. `totals.members` still counts policy tokens, for older clients, so people are
 * counted from `by_member`, unless that list hit its cap.
 */
export function memberCount(activity: AgentActivityResponse) {
  const people = peopleRows(activity).length
  if (activity.by_member.length < AGENT_ACTIVITY_LIMITS.maxMembers) return people
  return Math.max(activity.totals.members - activity.totals.policy_tokens, people)
}

/** A token's name; older audit rows grouped under a null token have none. */
export const policyTokenName = (row: { token_name?: string | null }) => row.token_name ?? LEGACY_TOKEN_LABEL

/**
 * q-core returns only the buckets with activity: add the empty ones between `from` and `to`, so a
 * chart shows quiet days as zero instead of skipping them.
 */
export function fillTimeline<T extends { start: string }>(
  points: T[],
  { from, to, bucket }: { from: string; to: string; bucket: AgentActivityBucket },
  empty: (start: string) => T
): T[] {
  const step = bucket === 'HOUR' ? 3_600_000 : 24 * 3_600_000
  const first = Math.floor(new Date(from).getTime() / step) * step
  const last = new Date(to).getTime()
  const byStart = new Map(points.map((point) => [Math.floor(new Date(point.start).getTime() / step) * step, point]))
  const filled: T[] = []
  for (let start = first; start < last; start += step) {
    filled.push(byStart.get(start) ?? empty(new Date(start).toISOString()))
  }
  return filled
}

/** Qovery skills with no load, action or denial in the period: candidates to turn off in a preset. */
export function unusedSkills(activity: AgentActivityResponse) {
  if (activity.by_skill.length >= AGENT_ACTIVITY_LIMITS.maxSkills) return []

  const used = new Set(
    activity.by_skill
      .filter(({ loads, actions, denials }) => loads + actions + denials > 0)
      .map(({ skill_name }) => skill_name)
  )
  return QOVERY_SKILLS.map(({ name }) => name).filter((name) => !used.has(name))
}

export type AgentActivityHint =
  | { kind: 'unused-skills'; skills: string[] }
  | { kind: 'environment-denials'; environment: string; count: number }
  /** `userSub` is null for a policy token: it can be named but not drilled into. */
  | { kind: 'member-denials'; userSub: string | null; userName: string; count: number }
  /** `tokenId` is null for older records that named no token: they can be shown, not filtered on. */
  | { kind: 'token-denials'; tokenId: string | null; tokenName: string; deleted: boolean; count: number }
  | { kind: 'loads-without-actions'; skillName: string; loads: number }

const REPEATED = 3

/**
 * Factual suggestions computed from the data. No scores and no ranking of people: each hint states
 * what happened and links to the setting that controls it.
 */
export function computeAgentActivityHints(
  activity: AgentActivityResponse,
  {
    filtered = false,
    source,
    outcome,
  }: { filtered?: boolean; source?: AgentActivitySource; outcome?: AgentActionOutcome } = {}
): AgentActivityHint[] {
  if (activity.totals.skill_loads + activity.totals.actions + activity.totals.denials === 0) return []
  const hints: AgentActivityHint[] = []

  // Only meaningful for the whole organization: one member not loading a skill says nothing.
  const unused = filtered ? [] : unusedSkills(activity)
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

  peopleRows(activity)
    // A drill into one member already shows their activity.
    .filter(({ denials }) => !filtered && denials >= REPEATED)
    .forEach(({ user_sub, user_name, denials }) =>
      hints.push({ kind: 'member-denials', userSub: user_sub ?? null, userName: user_name, count: denials })
    )
  ;(activity.by_policy_token ?? [])
    .filter(({ denials }) => !filtered && denials >= REPEATED)
    .forEach((row) =>
      hints.push({
        kind: 'token-denials',
        tokenId: row.policy_token_id ?? null,
        tokenName: policyTokenName(row),
        deleted: row.deleted,
        count: row.denials,
      })
    )

  // Source and outcome filters can omit actions that happened after a load.
  if (!source && !outcome) {
    for (const { skill_name, loads, actions, denials } of activity.by_skill) {
      if (skill_name && loads >= 5 && actions + denials === 0) {
        hints.push({ kind: 'loads-without-actions', skillName: skill_name, loads })
      }
    }
  }

  return hints
}

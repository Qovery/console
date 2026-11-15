import { type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import { QOVERY_SKILLS } from './qovery-skills'

/** Plain words for an audit event on a target: "Deploy", "Variable change"... */
export function actionLabel(event: string, targetType: string) {
  if (targetType === 'VARIABLE') return 'Variable change'
  switch (event) {
    case 'TRIGGER_DEPLOY':
      return 'Deploy'
    case 'TRIGGER_RESTART':
      return 'Restart'
    case 'TRIGGER_STOP':
      return 'Stop'
    case 'TRIGGER_DELETE':
    case 'DELETE':
      return 'Delete'
    case 'CREATE':
      return 'Create'
    case 'UPDATE':
      return 'Update'
    default:
      return event
        .toLowerCase()
        .replace(/^trigger_/, '')
        .replace(/_/g, ' ')
        .replace(/^\w/, (letter) => letter.toUpperCase())
  }
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

/** "Deploy a service", "Variable change", for the actions by type list. */
export const actionTypeLabel = (event: string, targetType: string) => {
  const action = actionLabel(event, targetType)
  return targetType === 'VARIABLE' ? action : `${action} (${targetLabel(targetType)})`
}

/** Qovery skills nobody loaded in the period: candidates to turn off in a preset. */
export function neverLoadedSkills(activity: AgentActivityResponse) {
  const loaded = new Set(activity.by_skill.filter(({ loads }) => loads > 0).map(({ skill_name }) => skill_name))
  return QOVERY_SKILLS.map(({ name }) => name).filter((name) => !loaded.has(name))
}

export type AgentActivityHint =
  | { kind: 'unused-skills'; skills: string[] }
  | { kind: 'environment-denials'; environment: string; count: number }
  | { kind: 'member-denials'; userSub: string; userName: string; count: number }
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
  if (activity.totals.skill_loads + activity.totals.actions === 0) return []
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

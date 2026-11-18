import {
  type AgentActionOutcome,
  type AgentActivityBucket,
  type AgentActivityParams,
  type AgentActivitySource,
} from '@qovery/domains/skill-presets/data-access'

/**
 * The Activity filters, kept in the URL so a filtered view can be shared or linked to:
 * `?range=7d&actor=token:<id>&outcome=DENIED&via=MCP_TOOL_CALL`. Every field is optional.
 */
export interface ActivitySearch {
  range?: string
  /** `members`, `tokens`, `member:<user sub>` or `token:<policy token id>`. */
  actor?: string
  /** A skill name, or `none` for actions that name no skill. */
  skill?: string
  outcome?: AgentActionOutcome
  /** The source of the actions. Named `via` in the URL, as `source` is used by another route. */
  via?: AgentActivitySource
  /** The breakdown shown: by member, by token or by skill. */
  view?: 'member' | 'token' | 'skill'
  /** The page of recent actions, from 1. */
  page?: number
}

export const ACTIVITY_RANGES: { value: string; label: string; hours: number; bucket: AgentActivityBucket }[] = [
  { value: '1d', label: '24 hours', hours: 24, bucket: 'HOUR' },
  { value: '7d', label: '7 days', hours: 24 * 7, bucket: 'DAY' },
  { value: '30d', label: '30 days', hours: 24 * 30, bucket: 'DAY' },
  { value: '90d', label: '90 days', hours: 24 * 90, bucket: 'DAY' },
]
export const DEFAULT_RANGE = '30d'
export const NO_SKILL = 'none'

export const SOURCE_FILTER_LABELS: Partial<Record<AgentActivitySource, string>> = {
  SKILL_API_ACTION: 'Skills',
  MCP_TOOL_CALL: 'MCP',
  POLICY_TOKEN_API_ACTION: 'Policy token calls (API, CLI, Terraform)',
  POLICY_DENIAL: 'Refused requests',
}

export const memberActor = (userSub: string) => `member:${userSub}`
export const tokenActor = (tokenId: string) => `token:${tokenId}`

export function parseActor(actor?: string) {
  if (actor === 'members') return { actorKind: 'MEMBER' as const }
  if (actor === 'tokens') return { actorKind: 'POLICY_TOKEN' as const }
  if (actor?.startsWith('member:')) return { userSub: actor.slice('member:'.length) }
  if (actor?.startsWith('token:')) return { policyTokenId: actor.slice('token:'.length) }
  return {}
}

export const activityRange = (search: ActivitySearch) =>
  ACTIVITY_RANGES.find(({ value }) => value === search.range) ?? ACTIVITY_RANGES[2]

/** The query params for the API. `to` is passed in, so the range stays stable between renders. */
export function activityParams(search: ActivitySearch, to: Date, scope: 'organization' | 'me'): AgentActivityParams {
  const range = activityRange(search)
  return {
    from: new Date(to.getTime() - range.hours * 3_600_000).toISOString(),
    to: to.toISOString(),
    bucket: range.bucket,
    // A member only ever sees their own activity: no actor filter.
    ...(scope === 'organization' ? parseActor(search.actor) : {}),
    skillName: search.skill && search.skill !== NO_SKILL ? search.skill : undefined,
    outcome: search.outcome,
    source: search.via,
  }
}

export const hasActivityFilters = (search: ActivitySearch) =>
  Boolean(search.actor || search.skill || search.outcome || search.via)
